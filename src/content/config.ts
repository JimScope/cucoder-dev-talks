import { z, defineCollection } from "astro:content";
import { glob } from 'astro/loaders';

const episodeSchema = z.object({
    title: z.string(),
    audioUrl: z.string(),
    pubDate: z.coerce.date().optional(),
    cover: z.string().optional(),
    explicit: z.boolean().optional(),
    episode: z.number().optional(),
    season: z.number().optional(),
    episodeType: z.string().optional(),
    duration: z.coerce.string(), //duration in format hh:mm:ss
    size: z.number(), // size in megabytes
});

export type episodeSchema = z.infer<typeof episodeSchema>;

const episodeCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/episode" }),
    schema: episodeSchema
});

export const collections = {
    'episode': episodeCollection,
}