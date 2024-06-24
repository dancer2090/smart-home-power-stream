import './App.css';
import Devices from './components/Devices';
import Invertor from './components/Invertor';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        POWER STREAM
      </header>
      <Invertor />
      <br />
      <Devices />
    </div>
  );
}

export default App;
