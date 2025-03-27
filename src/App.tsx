import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Main, HStack, VStack } from "./components/layout";
import { Text } from "./components/text";
import { Titlebar } from "./components/Titlebar";
import { TextBox } from "./components/textBox";
import { CodeEditor } from "./components/codeEditor";

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
    </ThemeProvider>
  );
}

export default App;
