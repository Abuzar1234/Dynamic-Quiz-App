import './App.css';
import { useNavigate } from 'react-router';

function App() {

  const navigate = useNavigate();
  const handleClick = () =>{
    navigate('/quiz');
  }
  return (
    <div className="main-section">
      <div className="description">
        “Challenge your mind with our dynamic quiz app! 🎯 Choose your favorite field, explore 
        topics that interest you, and enjoy smartly generated 
        questions powered by Google. Learn, play, and test your knowledge — anytime, anywhere.”
      </div>
      <button className="get-started" onClick={handleClick}> Get Started </button>
    </div>
  )
}

export default App
