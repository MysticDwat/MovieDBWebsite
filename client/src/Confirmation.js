import {useParams} from "react-router";
import {useState, useEffect} from "react";
import Navigation from "./Navigation";
import CookieConsent from "react-cookie-consent";

function Confirmation(){
    let {id, code} = useParams();

    const [hasChecked, setHasChecked] = useState(false);
    const [msg, setMsg] = useState('');

    async function checkCode(){
        if(!hasChecked){
            setHasChecked(true);
            await fetch(`/api/users/${id}/confirm/${code}`, {method: "GET"})
                .then(async (res) => {
                    let data = await res.json();
                    setMsg(data.message);
                })
                .catch((err) => console.log(err));
        }
    }

    useEffect(() => {
        checkCode().catch((err) => console.log(err))
    });

    return(
        <div className={"Confirmation View"}>
            <Navigation/>

            <div className={"Body"}>
                <p>{msg}</p>
            </div>

            <CookieConsent>This site uses cookies. By continuing to use this site, you agree to their use.</CookieConsent>
        </div>
    );
}

export default Confirmation;