/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import puppeteer from 'puppeteer';
import ogs from 'open-graph-scraper';

type QueryArgs = {
  url: string;
};

export async function autoScroll(page: any) {
  await page.evaluate(async () => {
    // @ts-ignore
    const win = window;
    // @ts-ignore
    const doc = document;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await new Promise((resolve: any) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = doc.body.scrollHeight;
        win.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function getSiteHTMLContent({ url }: { url: string }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0' });

  const data = await page.evaluate(() => document.documentElement?.outerHTML);
  await browser.close();
  return data;
}

export async function fbScrapper({ url }: { url: string }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0' });

  const pageData = await page.evaluate(() => document.documentElement?.outerHTML);

  // @ts-ignore
  const { result } = await ogs({ html: pageData });

  const image = await page.evaluate(() => {
    return document.querySelector('img')?.src;
  });

  await browser.close();
  return { ...result, image };
}

export async function ouedScrapper({ url }: { url: string }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0' });

  const elementsContent = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
      // @ts-ignore
    ).map((script) => script.innerText.replace(/’|'/g, '')),
  );

  const JSONparsedText = elementsContent
    .map((context) => JSON.parse(context))
    // .filter((context) => console.log({ context }));
    .filter((context) => {
      if (context !== null && context.constructor === Object) {
        return context['@type'].toUpperCase() === 'product'.toUpperCase();
      } else {
        false;
      }
    })[0];

  await browser.close();

  return JSONparsedText;
}

export async function getOpenGraphTags({ url }: QueryArgs) {
  const { hostname } = new URL(url);

  if (hostname.endsWith('facebook.com')) {
    return await fbScrapper({ url });
  }
  if (hostname.endsWith('ouedkniss.com') || hostname.endsWith('expat-dakar.com')) {
    return await ouedScrapper({ url });
  }

  const siteContent = await getSiteHTMLContent({ url });
  // @ts-ignore
  const { result } = await ogs({ html: siteContent });
  return result;
}
