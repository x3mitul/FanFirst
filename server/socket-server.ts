// WebSocket server for real-time community features with Prisma persistence
// Run with: npx ts-node --project tsconfig.server.json server/socket-server.ts

import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env explicitly
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

console.log('[Socket] Loaded env from:', envPath);
console.log('[Socket] DATABASE_URL exists:', !!process.env.DATABASE_URL);

import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const PORT = process.env.SOCKET_PORT || 3001;

// Initialize Prisma with pg adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('[Socket] ERROR: DATABASE_URL is not set!');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Lightweight in-memory stores (for real-time state only, not persistence)
const typingUsers: Map<string, Set<string>> = new Map(); // postId -> Set of userIds
const onlineUsers: Map<string, Set<string>> = new Map(); // communityId -> Set of userIds

io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    let currentUser: { id: string; name: string; avatar: string; fandomScore: number } | null = null;
    let currentCommunity: string | null = null;

    // User authentication
    socket.on('auth', (userData: { id: string; name: string; avatar: string; fandomScore: number }) => {
        currentUser = userData;
        socket.data.user = userData;
        console.log(`[Socket] User authenticated: ${userData.name}`);
    });

    // Join a community room
    socket.on('join:community', async (communityId: string) => {
        if (currentCommunity) {
            socket.leave(`community:${currentCommunity}`);
            onlineUsers.get(currentCommunity)?.delete(currentUser?.id || '');
        }

        currentCommunity = communityId;
        socket.join(`community:${communityId}`);

        if (!onlineUsers.has(communityId)) {
            onlineUsers.set(communityId, new Set());
        }
        if (currentUser) {
            onlineUsers.get(communityId)!.add(currentUser.id);
        }

        io.to(`community:${communityId}`).emit('online:count', {
            communityId,
            count: onlineUsers.get(communityId)?.size || 0,
        });

        console.log(`[Socket] ${currentUser?.name || socket.id} joined community: ${communityId}`);
    });

    // Join a post room (for comments)
    socket.on('join:post', (postId: string) => {
        socket.join(`post:${postId}`);
        console.log(`[Socket] ${currentUser?.name || socket.id} joined post: ${postId}`);
    });

    socket.on('leave:post', (postId: string) => {
        socket.leave(`post:${postId}`);
        typingUsers.get(postId)?.delete(currentUser?.id || '');
    });

    // Create a new post - PERSISTED TO DATABASE
    socket.on('post:create', async (postData: {
        communityId: string;
        authorId: string; // This is the Auth0 ID (e.g., "auth0|mock-user-1")
        title: string;
        content: string;
        type: string;
        images?: string[];
    }) => {
        try {
            // Find the user by Auth0 ID first
            let user = await prisma.user.findUnique({
                where: { auth0Id: postData.authorId },
            });

            // If no user found by Auth0 ID, try to find by regular ID
            if (!user) {
                user = await prisma.user.findUnique({
                    where: { id: postData.authorId },
                });
            }

            // If still no user, create a guest user
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        auth0Id: postData.authorId,
                        email: `${postData.authorId.replace(/[|]/g, '-')}@guest.local`,
                        name: 'Anonymous User',
                    },
                });
            }

            const post = await prisma.communityPost.create({
                data: {
                    communityId: postData.communityId,
                    authorId: user.id, // Use the actual user ID
                    title: postData.title,
                    content: postData.content,
                    type: postData.type,
                    images: postData.images || [],
                    upvotes: 1,
                    downvotes: 0,
                    commentCount: 0,
                },
                include: {
                    author: true,
                },
            });

            // Broadcast to community
            io.to(`community:${postData.communityId}`).emit('post:new', post);
            console.log(`[Socket] New post created: ${post.title}`);
        } catch (error) {
            console.error('[Socket] Error creating post:', error);
            socket.emit('error', { message: 'Failed to create post' });
        }
    });

    // Vote on a post - PERSISTED TO DATABASE
    socket.on('post:vote', async ({ postId, direction }: { postId: string; direction: 'up' | 'down' | null }) => {
        if (!currentUser) return;

        try {
            const post = await prisma.communityPost.findUnique({ where: { id: postId } });
            if (!post) return;

            // Get user's current vote
            const existingVote = await prisma.postVote.findUnique({
                where: { postId_userId: { postId, userId: currentUser.id } },
            });

            let upvotesDelta = 0;
            let downvotesDelta = 0;

            // Remove previous vote effect
            if (existingVote) {
                if (existingVote.type === 'up') upvotesDelta--;
                if (existingVote.type === 'down') downvotesDelta--;
                await prisma.postVote.delete({
                    where: { postId_userId: { postId, userId: currentUser.id } },
                });
            }

            // Apply new vote
            if (direction) {
                await prisma.postVote.create({
                    data: { postId, userId: currentUser.id, type: direction },
                });
                if (direction === 'up') upvotesDelta++;
                if (direction === 'down') downvotesDelta++;
            }

            // Update post vote counts
            const updatedPost = await prisma.communityPost.update({
                where: { id: postId },
                data: {
                    upvotes: { increment: upvotesDelta },
                    downvotes: { increment: downvotesDelta },
                },
            });

            // Broadcast vote update
            io.to(`community:${post.communityId}`).emit('post:vote:update', {
                postId,
                upvotes: updatedPost.upvotes,
                downvotes: updatedPost.downvotes,
            });

            console.log(`[Socket] Vote on ${postId}: ${direction} by ${currentUser.name}`);
        } catch (error) {
            console.error('[Socket] Error voting:', error);
        }
    });

    // Delete a post - PERSISTED TO DATABASE
    socket.on('post:delete', async ({ postId, authorId }: { postId: string; authorId: string }) => {
        try {
            const post = await prisma.communityPost.findUnique({ where: { id: postId } });
            if (!post) {
                socket.emit('error', { message: 'Post not found' });
                return;
            }

            // Check if the user is the author (by Auth0 ID or user ID)
            const user = await prisma.user.findFirst({
                where: {
                    OR: [{ auth0Id: authorId }, { id: authorId }],
                },
            });

            if (!user || user.id !== post.authorId) {
                socket.emit('error', { message: 'Not authorized to delete this post' });
                return;
            }

            // Delete the post (cascade will delete votes)
            await prisma.communityPost.delete({ where: { id: postId } });

            // Broadcast deletion to community
            io.to(`community:${post.communityId}`).emit('post:deleted', { postId });
            console.log(`[Socket] Post deleted: ${postId}`);
        } catch (error) {
            console.error('[Socket] Error deleting post:', error);
            socket.emit('error', { message: 'Failed to delete post' });
        }
    });

    // Typing indicator (stays in-memory - no need to persist)
    socket.on('typing:start', (postId: string) => {
        if (!currentUser) return;
        if (!typingUsers.has(postId)) {
            typingUsers.set(postId, new Set());
        }
        typingUsers.get(postId)!.add(currentUser.id);

        io.to(`post:${postId}`).emit('typing:update', {
            postId,
            users: Array.from(typingUsers.get(postId) || []),
        });
    });

    socket.on('typing:stop', (postId: string) => {
        if (!currentUser) return;
        typingUsers.get(postId)?.delete(currentUser.id);

        io.to(`post:${postId}`).emit('typing:update', {
            postId,
            users: Array.from(typingUsers.get(postId) || []),
        });
    });

    // Get posts for a community
    socket.on('posts:get', async (communityId: string) => {
        try {
            const posts = await prisma.communityPost.findMany({
                where: { communityId },
                include: { author: true },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
            socket.emit('posts:list', posts);
        } catch (error) {
            console.error('[Socket] Error fetching posts:', error);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (currentCommunity && currentUser) {
            onlineUsers.get(currentCommunity)?.delete(currentUser.id);
            io.to(`community:${currentCommunity}`).emit('online:count', {
                communityId: currentCommunity,
                count: onlineUsers.get(currentCommunity)?.size || 0,
            });
        }
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`[Socket] Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
});
