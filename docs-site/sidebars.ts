import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: "doc",
      id: "intro",
      label: "Plugin Name"
    },
    "installation",
    "quickstart",
    {
      type: "category",
      label: "Features",
      collapsible: true,
      items: [
        "features/overview"
      ]
    },
    "configuration",
    "changelog",
    "faq",
    "troubleshooting",
    "contributing",
    "support"
  ]
};

export default sidebars;
