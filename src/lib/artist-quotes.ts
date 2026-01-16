export interface ArtistQuote {
    id: string;
    quote: string;
    author: string;
    image: string;
    category?: string;
}

export const artistQuotes: ArtistQuote[] = [
    // Concert quotes
    {
        id: "quote-1",
        quote: "Music is the strongest form of magic.",
        author: "Marilyn Manson",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop",
        category: "concert"
    },
    {
        id: "quote-2",
        quote: "Without music, life would be a mistake.",
        author: "Friedrich Nietzsche",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
        category: "concert"
    },
    {
        id: "quote-3",
        quote: "Music can change the world because it can change people.",
        author: "Bono",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop",
        category: "concert"
    },
    // Festival quotes
    {
        id: "quote-4",
        quote: "Life is a festival only to the wise.",
        author: "Ralph Waldo Emerson",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop",
        category: "festival"
    },
    {
        id: "quote-5",
        quote: "The beat never stops. The journey never ends.",
        author: "Festival Wisdom",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=600&fit=crop",
        category: "festival"
    },
    // Sports quotes
    {
        id: "quote-6",
        quote: "Hard work beats talent when talent doesn't work hard.",
        author: "Tim Notke",
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=600&fit=crop",
        category: "sports"
    },
    {
        id: "quote-7",
        quote: "Champions keep playing until they get it right.",
        author: "Billie Jean King",
        image: "https://images.unsplash.com/photo-1504450758481-7338bbe7524a?w=600&h=600&fit=crop",
        category: "sports"
    },
    // Theater quotes
    {
        id: "quote-8",
        quote: "All the world's a stage, and all the men and women merely players.",
        author: "William Shakespeare",
        image: "https://images.unsplash.com/photo-1503095396549-807039045349?w=600&h=600&fit=crop",
        category: "theater"
    },
    {
        id: "quote-9",
        quote: "Theater is a mirror, a sharp reflection of society.",
        author: "Yasmina Reza",
        image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=600&fit=crop",
        category: "theater"
    },
    // Comedy quotes
    {
        id: "quote-10",
        quote: "Laughter is an instant vacation.",
        author: "Milton Berle",
        image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&h=600&fit=crop",
        category: "comedy"
    },
    {
        id: "quote-11",
        quote: "A day without laughter is a day wasted.",
        author: "Charlie Chaplin",
        image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&h=600&fit=crop",
        category: "comedy"
    },
    // Generic quotes for any event
    {
        id: "quote-12",
        quote: "Live for the moments you can't put into words.",
        author: "Unknown",
        image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=600&fit=crop"
    },
    {
        id: "quote-13",
        quote: "Create memories, not just moments.",
        author: "Unknown",
        image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=600&fit=crop"
    }
];

export function getQuoteForEvent(category?: string): ArtistQuote {
    const categoryQuotes = artistQuotes.filter(q => q.category === category);
    if (categoryQuotes.length > 0) {
        return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
    }
    // Fallback to generic quotes
    const genericQuotes = artistQuotes.filter(q => !q.category);
    return genericQuotes[Math.floor(Math.random() * genericQuotes.length)];
}
