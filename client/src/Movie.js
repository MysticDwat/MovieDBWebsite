import {useParams} from "react-router";
import {useState,useEffect} from "react";
import Navigation from "./Navigation";
import FavButton from "./FavButton";
import "./Movie.css";
import poster from "./poster.png";
import CookieConsent from "react-cookie-consent";

function Movie(){
    let {id} = useParams();

    const [hasMovie, setHasMovie] = useState(false);
    const [hasActors, setHasActors] = useState(false);
    const [hasImages, setHasImages] = useState(false);
    const [image, setImage] = useState('');
    const [title, setTitle] = useState('');
    const [rating, setRating] = useState(0);
    const [duration, setDuration] = useState('');
    const [date, setDate] = useState('');
    const [plot, setPlot] = useState('');
    const [actors, setActors] = useState([]);
    const [actorImgs, setActorImgs] = useState({});

    function getDuration(dur){
        return `${Math.floor(dur / 3600)}h ${Math.floor((dur % 3600) / 60)}m`;
    }

    function getDate(dateString){
        let rawDate = new Date(dateString);
        let date = `${String(rawDate.getMonth()).padStart(2,'0')}/` +
            `${String(rawDate.getDate()).padStart(2,'0')}/` +
            `${rawDate.getFullYear()}`;
        return date;
    }

    async function getMovie(){
        if(!hasMovie){
            setHasMovie(true);

            await fetch(`/api/movies/${id}`,{method: "GET"})
                .then(async (res) => {
                    let data = await res.json();

                    setImage(data.message["image"]);
                    setTitle(data.message["title"]);
                    setRating(data.message["rating"]);
                    setDuration(getDuration(data.message["duration"]));
                    setDate(getDate(data.message["date"]));
                    setPlot(data.message["plot"]);
                    setActors(data.message["actors"]);
                    setHasActors(true);
                })
                .catch((err) => console.log(err));
        }
    }

    async function getActorImages(){
        if(hasActors && !hasImages){
            setHasImages(true);

            let url = "https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&formatversion=2&prop=pageimages|pageterms&piprop=original&titles=";
            let images = {};

            actors.map(async (actor) => {
                await fetch(url + actor.replace(" ","%20"), {method:"GET"})
                    .then(async (res) => {
                        let data = await res.json();
                        images[actor] = data["query"]["pages"][0]["original"]["source"];
                        setActorImgs({...images});
                    })
                    .catch((err) => console.log(err));
            });
        }
    }

    useEffect(() => {
        getMovie().catch((err) => console.log(err));
        getActorImages().catch((err) => console.log(err));
    });

    return(
        <div className={"Movie View"}>
            <Navigation/>

            <div className={"Body"}>
                <div className={"MovieCard"}>
                    <img src={image}
                         onError={(e)=>{e.target.onerror = null; e.target.src=poster}}
                         alt={'Poster'}/>

                    <div className={"Desc"}>
                        <h1>{title}</h1>

                        <p>&#128504; Rating: {rating}</p>
                        <p>&#9201; Duration: {duration}</p>
                        <p>&#128467; Release Data: {date}</p>

                        <h3>&#9998; Plot</h3>
                        <p>{plot}</p>

                        <h3>&#9733; Actors</h3>

                        <ul className={"Actors"}>
                            {actors.map((actor) =>
                                <li key={actor}><img src={actorImgs[actor]} alt={actor + " Image"}/> {actor}</li>
                            )}
                        </ul>

                        <div>
                            <FavButton id={id}/>
                        </div>
                    </div>
                </div>
            </div>

            <CookieConsent>This site uses cookies. By continuing to use this site, you agree to their use.</CookieConsent>
        </div>
    );
}

export default Movie;