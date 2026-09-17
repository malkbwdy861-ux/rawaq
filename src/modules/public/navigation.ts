export const publicNavigationLinks = [
  ["الرئيسية", "/"],
  ["خدماتنا", "/services"],
  ["حلولنا", "/solutions"],
  ["المواد", "/materials"],
  ["مشاريعنا", "/projects"],
  ["الأدلة", "/guides"],
  ["من نحن", "/about"],
  ["الأسئلة الشائعة", "/faqs"],
  ["اتصل بنا", "/contact"],
] as const;

export const footerNavigationGroups = [
  {
    title: "الخدمات والمحتوى",
    links: [
      ["الخدمات", "/services"],
      ["الحلول", "/solutions"],
      ["المواد", "/materials"],
    ],
  },
  {
    title: "المعرفة والمشاريع",
    links: [
      ["المشاريع", "/projects"],
      ["الأسعار", "/prices"],
      ["الأدلة", "/guides"],
    ],
  },
  {
    title: "الشركة",
    links: [
      ["من نحن", "/about"],
      ["الأسئلة الشائعة", "/faqs"],
      ["تواصل معنا", "/contact"],
    ],
  },
] as const;
