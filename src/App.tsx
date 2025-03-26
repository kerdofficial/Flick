import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Main, HStack, VStack } from "./components/layout";
import { Text } from "./components/text";
import { Titlebar } from "./components/Titlebar";

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
        className="bg-card"
        noOverflow
      >
        <Titlebar />
        <VStack fullHeight fullWidth className="p-6" spacing="lg">
          <HStack
            alignment="center"
            distribution="equalSpacing"
            spacing="md"
            fullWidth
          >
            <Text variant="title" color="foreground" noSelect weight="semibold">
              Flick
            </Text>
          </HStack>
        </VStack>
      </Main>
    </ThemeProvider>
  );
}

export default App;
