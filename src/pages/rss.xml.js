import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import astropodConfig from "../../.astropod/astropod.config.json";
import { marked } from "marked";

export async function GET(context) {
  let episodes = await getCollection("episode");
  episodes.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  if (astropodConfig.feedSize) episodes = episodes.slice(0, astropodConfig.feedSize);

  return rss({
    title: astropodConfig.name,
    description: astropodConfig.description,
    site: context.site,
    items: episodes.map((episode) => ({
      title: episode.data.title,
      description: marked.parse(episode.body ? episode.body : ""),
      pubDate: episode.data.pubDate,
      link: `/episode/${episode.id}/`,
      enclosure: {
        url: isFullUrl(episode.data.audioUrl) ? episode.data.audioUrl : astropodConfig.link + episode.data.audioUrl,
        length: episode.data.size ? episode.data.size * 1000000 : 0,
        type: "audio/mpeg",
      },
      customData: `
        <itunes:episode>${episode.data.episode ?? ""}</itunes:episode>
        <itunes:season>${episode.data.season ?? ""}</itunes:season>
        <itunes:episodeType>${episode.data.episodeType ?? ""}</itunes:episodeType>
        <itunes:explicit>${episode.data.explicit === undefined ? astropodConfig.explicit : episode.data.explicit}</itunes:explicit>
        <itunes:duration>${episode.data.duration}</itunes:duration>
        <itunes:image href="${isFullUrl(episode.data.cover ? episode.data.cover : astropodConfig.cover) ? (episode.data.cover ? episode.data.cover : astropodConfig.cover) : astropodConfig.link + (episode.data.cover ? episode.data.cover : astropodConfig.cover)}" />
      `,
    })),
    customData: `
      <language>${astropodConfig.language}</language>
      <itunes:author>${astropodConfig.author}</itunes:author>
      <itunes:image href="${isFullUrl(astropodConfig.cover) ? astropodConfig.cover : astropodConfig.link + astropodConfig.cover}" />
      <itunes:summary>${astropodConfig.description}</itunes:summary>
      <itunes:type>episodic</itunes:type>
      <itunes:explicit>${astropodConfig.explicit}</itunes:explicit>
      <itunes:owner>
        <itunes:name>${astropodConfig.owner}</itunes:name>
        <itunes:email>${astropodConfig.email}</itunes:email>
      </itunes:owner>
      <itunes:category text="${astropodConfig.category[0]}" />
      ${astropodConfig.fundingUrl ? `<podcast:funding url="${isFullUrl(astropodConfig.fundingUrl) ? astropodConfig.fundingUrl : astropodConfig.link + astropodConfig.fundingUrl}">${astropodConfig.fundingText}</podcast:funding>` : ""}
    `,
    xmlns: {
      itunes: "http://www.itunes.com/dtds/podcast-1.0.dtd",
      podcast: "https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md",
      atom: "http://www.w3.org/2005/Atom",
      content: "http://purl.org/rss/1.0/modules/content/",
    },
  });
}

function isFullUrl(urlString) {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
}