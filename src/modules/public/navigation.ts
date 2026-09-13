export const publicNavigationLinks = [
  ["الرئيسية", "/"],
  ["خدماتنا", "/services"],
  ["حلولنا", "/solutions"],
  ["مشاريعنا", "/projects"],
  ["من نحن", "/about"],
  ["الأسئلة الشائعة", "/#faq"],
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
      ["المدونة", "/guides"],
    ],
  },
  {
    title: "الشركة",
    links: [
      ["من نحن", "/about"],
      ["الأسئلة الشائعة", "/#faq"],
      ["تواصل معنا", "/contact"],
    ],
  },
] as const;
