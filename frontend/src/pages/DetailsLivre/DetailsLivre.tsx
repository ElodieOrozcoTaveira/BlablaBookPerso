import { useState } from 'react';
import { FiSend } from "react-icons/fi";
import LastestReview from '../Latest Review/LatestReview';
import './DetailsLivre.scss';


export default function DetailsLivre() {

    const [rating, setRating]= useState(0)
    return(
        <>
        <section className="section-container">
            <div className="section-container__left">
                <img src="" alt="" className="section-container__cover" />
            </div>
            <div className="section-container__right">
                <h2 className="section-container__title">Titre du livre</h2>
                <p className="section-container__author">Auteur du livre</p>
                <p className="section-container__description">Résumé du livre</p>
                <button className="section-container__btn">Ajouter à ma bibliothèque</button>
            <div className="section-container__stars">
            {[1,2,3,4,5].map((star) => (
              <span
                key={star}
                className={star <= rating ? "star active" : "star"}
                onClick={() => setRating(star)}
                style={{ cursor: "pointer", fontSize: "2rem", color: star <= rating ? "#FFD700" : "#ccc" }}
                aria-label={`Note ${star} étoile${star > 1 ? "s" : ""}`}
                role="button"
                tabIndex={0}
              >
                ★
              </span>
            ))}
            </div>

          </div>


        </section>
        <article className="article-container">
            <label className="article-container__label" htmlFor="comment">Commentez le livre</label>
             <div className="article-container__input-group">
            <input className='article-container__input' type="text" id="comment" />
            <button className="article-container__comment-btn"><FiSend /></button>
        </div>
        </article>
        <LastestReview/>
        </>

    )
    }