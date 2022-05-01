import {useState, useEffect} from "react";
import "./FavButton.css";
import EventBus from "./EventBus";

function FavButton(props){
    const[hasFav, setHasFav] = useState(false);
    const [fav, setFav] = useState(false);

    async function favMovie(){
        await fetch(`/api/users/${fav ? "unfav" : "fav"}/${props.id}`, {method: "GET"})
            .then(async (res) => {
                let data = await res.json();

                if(res.status === 200){
                    EventBus.dispatch(props.id, {message: !fav})
                    console.log("send");
                    EventBus.dispatch('FavUpdate', {message: props.id});
                }else{
                    console.log(data.message);
                }
            })
            .catch((err) => console.log(err));
    }

    async function getFavMovie(){
        if(!hasFav){
            setHasFav(true);

            await fetch(`/api/movies/fav/${props.id}`, {method: "GET"})
                .then(async (res) => {
                    let data = await res.json();

                    if(res.status === 200){
                        setFav(data.message);
                    }else{
                        console.log(data.message);
                    }
                })
                .catch((err) => console.log(err));
        }
    }

    useEffect(() => {
        getFavMovie().catch((err) => console.log(err));
        EventBus.on(props.id, (data) => setFav(data.message));

        return(() => {
            EventBus.remove(props.id);
        });
    });

    return(
        <button className={`FavButton${fav ? " Fav" : ""}`} onClick={favMovie}>
            &#x2665; {fav ? "Favorited" : "Add to Favorites"}
        </button>
    );
}

export default FavButton;