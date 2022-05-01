import {useState} from "react";
import Navigation from "./Navigation";
import CookieConsent from "react-cookie-consent";

function Register(){
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [msg, setMsg] = useState('');

    function resetRegisterForm(){
        setFname('');
        setLname('');
        setEmail('');
        setPw('');
        setConfirmPw('');
        setMsg('');
    }

    let handleSubmit = async (e) => {
        e.preventDefault();

        await fetch("/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fname: fname,
                lname: lname,
                email: email,
                pw: pw,
                confirmPw: confirmPw
            })
        })
            .then(async (res) => {
                let data = await res.json();

                if(res.status === 400 || res.status === 500){
                    setMsg(data.message);
                } else if(res.status === 200){
                    resetRegisterForm();
                    setMsg(data.message);
                } else {
                    setMsg(`ERROR: You are not supposed to see this message. STATUS: ${res.status}`);
                    console.log(res);
                }
            })
            .catch((err) => console.log(err));
    }

    return(
        <div className={"Register View"}>
            <Navigation/>

            <div className={"Body"}>
                <div className={"Form"}>
                    <h1>Register</h1>

                    <form id={"RegisterForm"} onSubmit={handleSubmit}>
                        <div className={"Input"}>
                            <label htmlFor={"fname"}>First Name</label>
                            <input
                                type={"text"}
                                name={"fname"}
                                value={fname}
                                onChange={(e) => setFname(e.target.value)}
                                maxLength={64}
                            />
                        </div>

                        <div className={"Input"}>
                            <label htmlFor={"lname"}>Last Name</label>
                            <input
                                type={"text"}
                                name={"lname"}
                                value={lname}
                                onChange={(e) => setLname(e.target.value)}
                                maxLength={64}
                            />
                        </div>

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
                        </div>

                        <div className={"Input"}>
                            <label htmlFor={"confirmPw"}>Confirm Password</label>
                            <input
                                type={"password"}
                                name={"confirmPw"}
                                value={confirmPw}
                                onChange={(e) => setConfirmPw(e.target.value)}
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

export default Register;