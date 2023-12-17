import "./index.css";
import Menu from "./menu/menu";
import { AppContextProvider } from "./context/appstate";
import Canvas from "./grid/canvas";

function App() {
    return (
        <AppContextProvider>
            <div className="App">
                <header className="App-header">
                    <Menu />
                </header>
                <Canvas />
            </div>
        </AppContextProvider>
    );
}

export default App;
