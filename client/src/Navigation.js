import {Link} from "react-router-dom";
import "./Navigation.css";
import {useState, useEffect} from "react";

function Navigation(){
    const [name, setName] = useState('');
    const [hasName, setHasName] = useState(false);
    const [msg, setMsg] = useState('Get Session Id');

    async function deleteUser(){
        await fetch("/api/users/delete", {method: "GET"})
            .then(async (res) => {
                let data = await res.json();
                setMsg(data.message);
            })
            .catch((err) => console.log(err));
    }

    async function getUserName(){
        if(!hasName){
            setHasName(true);

            await fetch("/api/users/name", {method: "GET"})
                .then(async (res) => {
                    let data = await res.json();

                    if(res.status === 200){
                        setName(data.message);
                    }else{
                        setName('');
                    }
                })
                .catch((err) => console.log(err));
        }
    }

    useEffect(() => {
        getUserName().catch((err) => console.log(err));
    });

    return(
        <div className={"Navigation"}>
            <Link to="/" className={"Home Link"}>Home</Link>
            <Link to="/register" className={"Link"}>Register</Link>
            {name !== '' ? <Link to="/settings" className={"Link"}>Welcome, {name}!</Link> :
                <Link to="/login" className={"Link"}>Login</Link>}
        </div>
    );
}

export default Navigation;