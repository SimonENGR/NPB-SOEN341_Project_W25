// import { useState } from "react";
// import user_icon from './assets/person.png/';
// import email_icon from './assets/email.png';
// import password_icon from './assets/password.png';
// import chat_icon from './assets/chat.png';

// const LoginPage = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [action,setAction] = useState("Login")

//   const handleLogin = (e) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       setError("Please enter both email and password.");
//       return;
//     }

//     console.log("Logging in with:", email, password);
//     setError("");
//     // Here, you would typically send a request to your backend API for authentication.
//   };

//   return (
    
//     <div className="container">
//       <div className="header">
//         <h2 className="title">{action}</h2>
        
//         {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

//         <div className="inputs">
//           {action==="Login"?<div></div>:  <div className="input">
//           <img src={user_icon}></img>
//           <input type="text" placeholder="Name"></input>
//         </div>}
      

//         <form onSubmit={handleLogin} className="flex flex-col">
//           <div className="input">
//           <img src={email_icon}></img>
//           <input
//             type="email"
//             placeholder="Email"
//             className="border p-2 rounded mb-2"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           </div>
//           <div className="input">
//           <img src={password_icon}></img>
//           <input
//             type="password"
//             placeholder="Password"
//             className="border p-2 rounded mb-4"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           </div>
// {/* 
//           <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
//             Login
//           </button> */}
          
//         </form>
//       </div> 
//       {action==="Sign Up"?<div></div>:<div className="forgot-password">Forgot Password? <span>Click here!</span></div>
// }
//       <div className="submit-container">
//         <div className={action==="Login"?"submit gray":"submit"} onClick={() => {setAction("Login")}}>Sign Up</div>
//         <div className={action==="Sign Up"?"submit gray":"submit"} onClick={() => {setAction("Sign Up")}}>Login</div>

//       </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;



import { useState } from "react";
import user_icon from './assets/person.png';
import email_icon from './assets/email.png';
import password_icon from './assets/password.png';
import chat_icon from './assets/chat.png';
import logo from './assets/chat.png'; // Your logo image

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [action, setAction] = useState("Login");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    console.log("Logging in with:", email, password);
    setError("");
  };

  return (
    <div className="login-container">
      {/* Left side - Logo */}
      <div className="logo-container">
        <img src={logo} alt="App Logo" className="logo" />
      </div>

      {/* Right side - Login form */}
      <div className="container">
        <div className="header">
          <h2 className="title">{action}</h2>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <div className="inputs">
            {action === "Login" ? null : (
              <div className="input">
                <img src={user_icon} alt="User Icon" />
                <input type="text" placeholder="Name" />
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col">
              <div className="input">
                <img src={email_icon} alt="Email Icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input">
                <img src={password_icon} alt="Password Icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </form>
          </div>

          {action === "Sign Up" ? null : (
            <div className="forgot-password">
              Forgot Password? <span>Click here!</span>
            </div>
          )}

          <div className="submit-container">
            <div
              className={action === "Login" ? "submit gray" : "submit"}
              onClick={() => setAction("Login")}
            >
              Sign Up
            </div>
            <div
              className={action === "Sign Up" ? "submit gray" : "submit"}
              onClick={() => setAction("Sign Up")}
            >
              Login
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
