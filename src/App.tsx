import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Main, VStack } from "./components/layout";
import { Titlebar } from "./components/Titlebar";
import { CodeEditor } from "./components/codeEditor";
import { Toaster } from "@/components/shadcn/sonner";

function App() {
  return (
    <ThemeProvider>
      <Main
        stack="VStack"
        fullWidth
        fullHeight
        spacing="none"
        alignment="leading"
        wrap="nowrap"
        distribution="start"
        className="bg-card pt-8"
        noOverflow
      >
        <Titlebar />
        <VStack
          fullHeight
          fullWidth
          spacing="md"
          alignment="leading"
          distribution="start"
          wrap="nowrap"
        >
          <CodeEditor height="100%" />
        </VStack>
      </Main>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
