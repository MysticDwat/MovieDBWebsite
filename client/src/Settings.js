import {useState} from "react";
import Navigation from "./Navigation";
import CookieConsent from "react-cookie-consent";
import "./Settings.css";

function Settings() {
    const [dltBtn, setDltBtn] = useState('Delete Account');
    const [dltConfirm, setDltConfirm] = useState(false);
    const [dlted, setDlted] = useState(false);

    async function deleteAccount(){
        if(!dltConfirm){
            setDltConfirm(true);
            setDltBtn('Click again to confirm account deletion.');
        }else if(dltConfirm && !dlted){
            await fetch("/api/users/delete")
                .then((res) => {
                    if(res.status === 200){
                        setDltBtn("Your account has been deleted.");
                        setDlted(true);
                    }
                });
        }
    }

    return (
        <div className="Settings View">
            <Navigation/>

            <div className={"Body"}>
                <h1>Settings</h1>

                <button className={"Delete"} onClick={deleteAccount}>{dltBtn}</button>
            </div>

            <CookieConsent>This site uses cookies. By continuing to use this site, you agree to their use.</CookieConsent>
        </div>
    );
}

export default Settings;