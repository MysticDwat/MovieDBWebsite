import poster from "./poster.png";
import "./Card.css";
import {Link} from "react-router-dom";
import FavButton from "./FavButton";

function Card(props){
    return(
        <div className={"Card"}>
            <img src={props.image}
                 onError={(e)=>{e.target.onerror = null; e.target.src=poster}}
                 alt={'Poster'}/>
            
            <h1>{props.title}</h1>
            <p>&#128504; Rating: {props.rating}</p>
            <p>&#9201; Duration: {props.duration}</p>

            <div>
                <Link to={`/movies/${props.id}`} className={"Link"}>&#x1F441; View More</Link>
                <FavButton id={props.id}/>
            </div>
        </div>
    );
}

export default Card;