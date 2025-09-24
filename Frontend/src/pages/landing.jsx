import mobile from '../assets/mobile.svg';
import { Link } from 'react-router-dom';


const LandingPage = () => {
  return (
    <div className='landingPageContainer'>
        <nav>
            <div className='navHeader'>
                <h2>Vidora!</h2>
            </div>
            <div className="navlist">
              <p role='button' onClick={() => {
                window.location.href = "/random75897234"
              }}>Join as Guest</p>
              <p onClick={()=>{
                window.location.href = "/auth"
              }} >Register</p>
              <p onClick={()=>{
                window.location.href = "/auth"
              }} >Login</p>
            </div>
        </nav>

        <div className="landingMainContainer">
          <div className="heading">
            <h1><span style={{color: "#FFB800"}}>Connect</span> with your loved ones.</h1>
            <p>Join our community and stay connected with your family and friends❤️.</p>
            <button className='start'>
              <Link to="/home">Get Started</Link>
              </button>
          </div>
          <div className="mobile">
            <img src={mobile} alt="mobile" />
          </div>
        </div>

    </div>
  )
}

export default LandingPage
