import fs from 'node:fs';

const file = new URL('../src/data/pages.json', import.meta.url);
const pages = JSON.parse(fs.readFileSync(file, 'utf8'));

const metadata = {
  '': {
    title: 'อุปกรณ์นิวเมติก ไฮดรอลิค และไส้กรองอุตสาหกรรม | Pneumatic Dotcom',
  },
  about: { title: 'เกี่ยวกับบริษัทและช่องทางติดต่อ | Pneumatic Dotcom' },
  'aftercoolers-factory': { title: 'เครื่องระบายความร้อน Aftercooler ในโรงงาน | Pneumatic Dotcom' },
  'air-compressor': { title: 'เครื่องอัดลมในระบบนิวเมติก | Pneumatic Dotcom' },
  blog: {
    title: 'บทความวิศวกรรมและความรู้สำหรับโรงงาน | Pneumatic Dotcom',
    description: 'รวมบทความวิศวกรรม ระบบนิวเมติก เครื่องอัดลม ระบบไฮดรอลิค และความรู้สำหรับโรงงานอุตสาหกรรมจาก Pneumatic Dotcom',
  },
  engineer: { title: 'ความรู้เกี่ยวกับงานวิศวกรรม | Pneumatic Dotcom' },
  filter: { title: 'ไส้กรองอุตสาหกรรมและงานบริการ | Pneumatic Dotcom' },
  gefran: { title: 'อุปกรณ์ไฟฟ้า GEFRAN สำหรับงานอุตสาหกรรม | Pneumatic Dotcom' },
  hydraulic: { title: 'อุปกรณ์ไฮดรอลิคและงานบริการ | Pneumatic Dotcom' },
  'hydraulic-cylinder-overhaul': {
    title: 'งานปรับปรุงกระบอกไฮดรอลิค | Pneumatic Dotcom',
    description: 'บริการตรวจสอบ ซ่อม และปรับปรุงคุณภาพกระบอกไฮดรอลิคสำหรับงานอุตสาหกรรม พร้อมตัวอย่างผลงานจริงจากทีมวิศวกร',
  },
  'plc-type': { title: 'ชนิดของ PLC ข้อดี ข้อเสีย และการใช้งาน | Pneumatic Dotcom' },
  pneumatic: { title: 'อุปกรณ์นิวเมติกและงานบริการ | Pneumatic Dotcom' },
  privacy: { title: 'นโยบายความเป็นส่วนตัว | Pneumatic Dotcom' },
  'purchasing-department-tips': { title: 'กลยุทธ์การจัดซื้อในโรงงานยุคใหม่ | Pneumatic Dotcom' },
  'tag/air-compressor': {
    title: 'บทความ Air Compressor | Pneumatic Dotcom',
    description: 'บทความเกี่ยวกับ Air Compressor เครื่องอัดลม และระบบลมอัดสำหรับโรงงานอุตสาหกรรม',
  },
  'tag/plc': {
    title: 'บทความ PLC สำหรับงานวิศวกรรม | Pneumatic Dotcom',
    description: 'บทความเกี่ยวกับ PLC ประเภท การเลือกใช้งาน ข้อดีและข้อเสียสำหรับงานวิศวกรรมและโรงงานอุตสาหกรรม',
  },
};

const productGalleryLabels = {
  about: 'ภาพสำนักงานและผลงานของบริษัท',
  filter: 'ตัวอย่างไส้กรองอุตสาหกรรมที่จัดส่งจริง',
  gefran: 'ตัวอย่างอุปกรณ์ GEFRAN ที่จัดส่งจริง',
  hydraulic: 'ตัวอย่างอุปกรณ์ไฮดรอลิคที่จัดส่งจริง',
  'hydraulic-cylinder-overhaul': 'ขั้นตอนงานปรับปรุงกระบอกไฮดรอลิค',
  pneumatic: 'ตัวอย่างอุปกรณ์นิวเมติกที่จัดส่งจริง',
};

const exactImageAlts = {
  '/images/about/google-business-profile.png': 'โลโก้ Google Business Profile',
  '/images/about/creden-data.png': 'โลโก้ CredenData',
  '/images/customers/m1.jpg': 'โลโก้บริษัท ปตท. จำกัด (มหาชน)',
  '/images/customers/m2.jpg': 'โลโก้ Mazda',
  '/images/customers/m3.jpg': 'โลโก้ GPSC',
  '/images/customers/m4.jpg': 'โลโก้ SCG',
  '/images/customers/m5.jpg': 'โลโก้ IRPC',
  '/images/customers/m6.jpg': 'โลโก้ Bridgestone',
  '/wp-content/uploads/2025/09/M_gainfriends_2dbarcodes_GW.webp': 'คิวอาร์โค้ด LINE @pneumatic',
  '/wp-content/uploads/2024/03/IMG_1747.webp': 'โลโก้แบรนด์อุปกรณ์นิวเมติกที่บริษัทจัดจำหน่าย',
  '/wp-content/uploads/2024/03/IMG_1748.webp': 'โลโก้แบรนด์อุปกรณ์ไฮดรอลิคที่บริษัทจัดจำหน่าย',
  '/wp-content/uploads/2024/03/IMG_1751.webp': 'โลโก้แบรนด์ไส้กรองอุตสาหกรรมที่บริษัทจัดจำหน่าย',
  '/wp-content/uploads/2025/05/GEFRAN.webp': 'โลโก้ GEFRAN',
  '/wp-content/uploads/2025/05/support-rma-sensors.webp': 'บริการสนับสนุนและ RMA เซนเซอร์ GEFRAN',
  '/wp-content/uploads/2024/09/Single-Stage-Reciprocating-Compressor-1.webp': 'แผนภาพเครื่องอัดลมแบบลูกสูบขั้นตอนเดียว',
};

const heroImageAlts = {
  about: 'ภายในโรงงานอุตสาหกรรมที่บริษัทให้บริการ',
  'aftercoolers-factory': 'ระบบท่อและเครื่องจักรภายในโรงงานอุตสาหกรรม',
  'air-compressor': 'เครื่องอัดลมในระบบนิวเมติกภายในโรงงาน',
  blog: 'ช่างวิศวกรรมกำลังปฏิบัติงานในโรงงาน',
  filter: 'ระบบบำบัดและกรองในโรงงานอุตสาหกรรม',
  gefran: 'อุปกรณ์ควบคุมในระบบอัตโนมัติอุตสาหกรรม',
  hydraulic: 'ระบบไฮดรอลิคและท่อภายในโรงงาน',
  'hydraulic-cylinder-overhaul': 'ระบบไฮดรอลิคในโรงงานอุตสาหกรรม',
  'plc-type': 'ช่างกำลังติดตั้งอุปกรณ์ควบคุม PLC',
  pneumatic: 'อุปกรณ์นิวเมติกในระบบอัตโนมัติ',
  'purchasing-department-tips': 'วิศวกรกำลังตรวจแบบและวางแผนจัดซื้อ',
};

const normalizeImageAlts = (html = '', route = '') => {
  let galleryIndex = 0;
  let imageIndex = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    imageIndex += 1;
    const src = tag.match(/\bsrc="([^"]+)"/i)?.[1] || '';
    const currentAlt = tag.match(/\balt="([^"]*)"/i)?.[1]?.trim() || '';
    let alt = exactImageAlts[src];

    if (!alt && imageIndex === 1 && heroImageAlts[route]) alt = heroImageAlts[route];
    if (!alt && productGalleryLabels[route] && /\/IMG_[^/]+\.(?:webp|jpg|png)$/i.test(src)) {
      galleryIndex += 1;
      alt = `${productGalleryLabels[route]} ภาพที่ ${galleryIndex}`;
    }
    if (!alt) alt = currentAlt || 'ภาพประกอบเนื้อหา';

    const escapedAlt = alt.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    return /\balt="[^"]*"/i.test(tag)
      ? tag.replace(/\balt="[^"]*"/i, `alt="${escapedAlt}"`)
      : tag.replace(/>$/, ` alt="${escapedAlt}">`);
  });
};

const normalizeHtml = (html = '', route = '') => normalizeImageAlts(html, route)
  .replace(
    /<a href="\/cdn-cgi\/l\/email-protection#[^"]+"[^>]*><span class="__cf_email__"[^>]*>\[email&nbsp;protected\]<\/span><\/a>/g,
    '<a href="mailto:sale.pneumatic@gmail.com">sale.pneumatic@gmail.com</a>',
  )
  .replace(
    /<a href="\/cdn-cgi\/l\/email-protection" class="__cf_email__"[^>]*>\[email&nbsp;protected\]<\/a>/g,
    '<a href="mailto:sale.pneumatic@gmail.com">sale.pneumatic@gmail.com</a>',
  )
  .replace(/alt="([^"]+?)\s*»\s*2026"/g, 'alt="$1"');

for (const page of pages) {
  if (page.redirect) {
    page.redirect = '/blog/';
    page.title = 'กำลังไปยังหน้าบทความ';
    continue;
  }

  Object.assign(page, metadata[page.route] || {});
  page.html = normalizeHtml(page.html, page.route);
  page.footerHtml = normalizeHtml(page.footerHtml, page.route);
}

fs.writeFileSync(file, `${JSON.stringify(pages, null, 2)}\n`);
