# Portfolio Content Authoring

## Project Identity

`slug` is the permanent machine identity. It is the URL, folder name, and internal link target. Keep it stable after launch.

`title` is the public name. Change this when the displayed project name changes.

`showInWorks` controls whether the project appears in the vertical Works spine. Keep this curated to the main project set.

`status` controls visibility. Use `public`, `draft`, or `hidden`.

## Folder Shape

```txt
content/projects/{slug}/
  project.md
  gallery.csv

public/images/projects/{slug}/
  001-hero.webp
  002-process.webp
  003-video-poster.webp
```

## Gallery CSV

Use one row per rail slide. Supported `type` values are `image`, `text`, `video`, and `audio`.

Required columns:

```csv
order,type,file,youtubeId,chapter,role,title,caption,body,emphasis
```

For text cards, leave `file` empty. For YouTube slides, use a real `youtubeId`; videos stay hosted on YouTube but play inside the portfolio lightbox.

## Image Preparation

Default to WebP, sRGB, original aspect ratio preserved.

- Hero images: long edge around 2800px, quality around 82
- Rail images: long edge around 2000px, quality around 80
- Thumbnails/posters: long edge around 1000px, quality around 75

Use PNG only for transparency, logos, diagrams, or screenshots where WebP damages small text.
