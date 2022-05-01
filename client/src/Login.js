import {useState} from "react";
import Navigation from "./Navigation";
import CookieConsent from "react-cookie-consent";

function Login(){
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [msg, setMsg] = useState('');

    function resetLoginForm(){
        setEmail('');
        setPw('');
        setMsg('');
    }

    let handleSubmit = async (e) => {
        e.preventDefault();

        await fetch("/api/users/login",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                pw: pw
            })
        })
            .then(async (res) => {
                let data = await res.json();

                if(res.status === 400 || res.status === 500){
                    setMsg(data.message);
                }else if(res.status === 200){
                    resetLoginForm();
                    setMsg(data.message);
                }else if(res.status === 401){
                    resetLoginForm();
                    setMsg(data.message);
                }else {
                    setMsg(`ERROR: You are not supposed to see this message. STATUS: ${res.status}`);
                    console.log(res);
                }
            })
            .catch((err) => console.log(err));
    }


    return(
        <div className={"Login View"}>
            <Navigation/>

            <div className={"Body"}>
                <div className={"Form"}>
                    <h1>Login</h1>

                    <form id={"LoginForm"} onSubmit={handleSubmit}>
                        <div className={"Input"}>
                            <label htmlFor={"email"}>Email</label>
                            <input
                                type={"text"}
                                name={"email"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                maxLength={64}
                            />
                        </div>

                        <div className={"Input"}>
                            <label htmlFor={"pw"}>Password</label>
                            <input
                                type={"password"}
                                name={"pw"}
                                value={pw}
                                onChange={(e) => setPw(e.target.value)}
                                maxLength={64}
                            />
                        </div><br/>

                        <div className={"Button"}>
                            <input type={"submit"} value={"Submit"}/>
                        </div>

                        <p>{msg}</p>
                    </form>
                </div>
            </div>

            <CookieConsent>This site uses cookies. By continuing to use this site, you agree to their use.</CookieConsent>
        </div>
    );
}

export default Login;