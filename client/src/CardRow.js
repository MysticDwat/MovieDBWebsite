import {useState, useEffect} from "react";
import Card from "./Card";
import "./CardRow.css";
import EventBus from "./EventBus";

function CardRow(props){
    const [hasCards, setHasCards] = useState(false);
    const [cards, setCards] = useState([]);

    async function getCards(){
        if(!hasCards){
            setHasCards(true);

            await fetch((props.title === "Favorites" ? "/api/users/favs" : `/api/movies/genres/${props.title}`), {
                method: "GET"
            })
                .then(async (res) => {
                    let data = await res.json();

                    if(res.status === 500){
                        console.log(data.message);
                    }else if(res.status === 200){
                        let cardList = [];

                        for(let i in data.message){
                            cardList = [...cardList,
                                <Card key={data.message[i]["_id"]}
                                      image={data.message[i]["image"]}
                                      title={data.message[i]["title"]}
                                      rating={data.message[i]["rating"]}
                                      duration={`${Math.floor(data.message[i]["duration"] / 3600)}h `
                                          + `${Math.floor((data.message[i]["duration"] % 3600) / 60)}m`}
                                      id={data.message[i]["_id"]}
                                />];
                        }

                        setCards(cardList);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    async function getCard(id){
        await fetch(`/api/movies/${id}`,{method: "GET"})
            .then(async (res) => {
                let data = await res.json();

                setCards([...cards,
                    <Card key={data.message["_id"]}
                          image={data.message["image"]}
                          title={data.message["title"]}
                          rating={data.message["rating"]}
                          duration={`${Math.floor(data.message["duration"] / 3600)}h `
                              + `${Math.floor((data.message["duration"] % 3600) / 60)}m`}
                          id={data.message["_id"]}
                    />]);
            })
            .catch((err) => console.log(err));
    }

    useEffect(() => {
        getCards().catch((err) => console.log(err));

        if(props.title === "Favorites"){
            EventBus.on('FavUpdate', () => setHasCards(false));
        }

        return(() => {
            if(props.title === "Favorites"){
                EventBus.remove('FavUpdate');
            }
        });
    });

    return(
        <div className={"CardRow" + (cards.length > 0 ? "" : " Hide")}>
            <h1 className={"RowHeader"}>{props.title}</h1>

            <section className={"CardContainer"}>
                {cards}
            </section>
        </div>
    );
}

export default CardRow;