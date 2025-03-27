declare global {
  interface Window {
    prettier: any;
    prettierPlugins: any;
  }
}

export const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "markdown", label: "Markdown" },
  { value: "python", label: "Python" },
];

export const formatCode = async (code: string, lang: string) => {
  if (!code.trim()) return { code, success: true };

  try {
    if (!window.prettier) {
      console.error("Prettier is not loaded. Adding script to load it...");
      await loadPrettier();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (lang === "json") {
      try {
        const jsonObject = JSON.parse(code);
        return { code: JSON.stringify(jsonObject, null, 2), success: true };
      } catch (err) {
        console.warn("Invalid JSON", err);
        return {
          code,
          success: false,
          error: "Invalid JSON syntax. Could not format.",
        };
      }
    }

    let formattedCode = code;
    const prettier = window.prettier;
    const plugins = window.prettierPlugins || {};

    console.log(
      "Attempting to format",
      lang,
      "with available plugins:",
      Object.keys(plugins).join(", ")
    );

    const config: any = {
      singleQuote: true,
      tabWidth: 2,
    };

    switch (lang) {
      case "javascript":
      case "js":
        if (!plugins.babel) {
          console.warn("Babel plugin not available");
          return {
            code,
            success: false,
            error: "JavaScript formatter plugin not available",
          };
        }
        config.parser = "babel";
        config.plugins = [plugins.babel];
        break;

      case "typescript":
      case "ts":
        if (!plugins.typescript) {
          console.warn("TypeScript plugin not available");
          return {
            code,
            success: false,
            error: "TypeScript formatter plugin not available",
          };
        }
        config.parser = "typescript";
        config.plugins = [plugins.typescript];
        break;

      case "html":
        if (!plugins.html) {
          console.warn("HTML plugin not available");
          return {
            code,
            success: false,
            error: "HTML formatter plugin not available",
          };
        }
        config.parser = "html";
        config.plugins = [plugins.html];
        break;

      case "css":
        if (!plugins.postcss) {
          console.warn("PostCSS plugin not available");
          return {
            code,
            success: false,
            error: "CSS formatter plugin not available",
          };
        }
        config.parser = "css";
        config.plugins = [plugins.postcss];
        break;

      case "markdown":
      case "md":
        if (!plugins.markdown) {
          console.warn("Markdown plugin not available");
          return {
            code,
            success: false,
            error: "Markdown formatter plugin not available",
          };
        }
        config.parser = "markdown";
        config.plugins = [plugins.markdown];
        config.proseWrap = "always";
        break;

      default:
        return {
          code,
          success: false,
          error: `Unsupported language: ${lang}`,
        };
    }

    formattedCode = await prettier.format(code, config);
    return { code: formattedCode, success: true };
  } catch (error) {
    console.error("Formatting error:", error);
    let errorMessage = "Failed to format code.";

    if (error instanceof Error) {
      // Try to extract the most useful part of the error message
      errorMessage = error.message.split("\n")[0] || errorMessage;
    }

    return {
      code,
      success: false,
      error: errorMessage,
    };
  }
};

export const loadPrettier = async () => {
  return new Promise<void>((resolve, reject) => {
    if (window.prettier) {
      resolve();
      return;
    }

    const prettierScript = document.createElement("script");
    prettierScript.src = "https://unpkg.com/prettier@2.8.8/standalone.js";
    prettierScript.onload = () => {
      console.log("Prettier standalone loaded successfully");

      if (!window.prettierPlugins) {
        window.prettierPlugins = {};
      }

      const pluginScripts = [
        {
          name: "babel",
          src: "https://unpkg.com/prettier@2.8.8/parser-babel.js",
        },
        {
          name: "typescript",
          src: "https://unpkg.com/prettier@2.8.8/parser-typescript.js",
        },
        {
          name: "html",
          src: "https://unpkg.com/prettier@2.8.8/parser-html.js",
        },
        {
          name: "postcss",
          src: "https://unpkg.com/prettier@2.8.8/parser-postcss.js",
        },
        {
          name: "markdown",
          src: "https://unpkg.com/prettier@2.8.8/parser-markdown.js",
        },
      ];

      let loadedCount = 0;
      const totalPlugins = pluginScripts.length;

      const onPluginLoad = (name: string) => {
        console.log(`Prettier plugin loaded: ${name}`);
        loadedCount++;
        if (loadedCount === totalPlugins) {
          console.log("All Prettier plugins loaded successfully");
          console.log(
            "Available plugins:",
            Object.keys(window.prettierPlugins).join(", ")
          );
          resolve();
        }
      };

      pluginScripts.forEach(({ name, src }) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => onPluginLoad(name);
        script.onerror = () => {
          console.warn(`Failed to load Prettier plugin: ${name} (${src})`);
          onPluginLoad(name);
        };
        document.head.appendChild(script);
      });
    };

    prettierScript.onerror = (error) => {
      console.error("Failed to load Prettier:", error);
      reject(error);
    };

    document.head.appendChild(prettierScript);
  });
};
