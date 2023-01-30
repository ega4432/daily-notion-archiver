import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { writeFile } from "fs";
import "dotenv/config";

const databaseId = process.env.DATABASE_ID || "";
// const pageId = process.env.PAGE_ID || "";
const auth = process.env.NOTION_API_KEY || "";

const notionClient = new Client({ auth });

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient });

const getPage = async (pageId: string) => {
  if (!pageId) {
    console.error(`pageId is undefined.`);
    return;
  }

  const mdblocks = await n2m.pageToMarkdown(pageId, 2);

  // custom transfer
  // n2m.setCustomTransformer("embed", async (block) => {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const { embed } = block as any;
  //   if (!embed?.url) return "";
  //   return `<figure>
  //   <iframe src="${embed?.url}"></iframe>
  //   <figcaption>${await n2m.blockToMarkdown(embed?.caption)}</figcaption>
  // </figure>`;
  // });

  const mdString = n2m.toMarkdownString(mdblocks);

  //writing to file
  writeFile("output/test.md", mdString, (err) => {
    console.log(err);
  });
};

const getPageList = async () => {
  try {
    const response = await notionClient.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: "Name",
            title: {
              equals: "2023-01-29",
            },
          },
        ],
      },
    });
    const pages = response.results;

    if (pages.length === 1) {
      return pages[0].id;
    }

    return "";
  } catch (e) {
    console.error(e);
  }
};

(async () => {
  const pageId = await getPageList();
  if (pageId) {
    await getPage(pageId);
  }
})();
