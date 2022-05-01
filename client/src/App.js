import {useState, useEffect} from "react";
import CardRow from "./CardRow";
import Navigation from "./Navigation";
import CookieConsent from "react-cookie-consent";
import "./App.css";

function App() {
    const [cardRows, setCardRows] = useState([]);
    const [hasGenres, setHasGenres] = useState(false);

    async function getGenres(){
        if(!hasGenres){
            setHasGenres(true);

            await fetch("/api/movies/genres",{method:"GET"})
                .then(async (res) =>{
                    let data = await res.json();

                    if(res.status === 400 || res.status === 500){
                        console.log(data.message);
                    } else if(res.status === 200){
                        let genreList = [];

                        for(let i in data.message){
                            genreList = [...genreList, <CardRow key={i} title={data.message[i]}/>]
                        }

                        setCardRows(genreList);
                    } else {
                        console.log(`ERROR: You are not supposed to see this message. STATUS: ${res.status}`);
                        console.log(res);
                    }
                })
                .catch((err) => console.log(err));
        }
    }

    useEffect(() => {
        getGenres().catch((err) => console.log(err));
    });

    return (
        <div className="App View">
            <Navigation/>

            <div className={"Body"}>
                <CardRow title={"Favorites"}/>
                {cardRows}
            </div>

            <CookieConsent>This site uses cookies. By continuing to use this site, you agree to their use.</CookieConsent>
        </div>
    );
}

export default App;
