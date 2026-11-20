import React from "react";
import { score } from "../utils/presentation";
export default function StoreCard({ store: s, index: i, user, busy, onRate }) {
  return (
    <article className="store-card" key={s.id}>
      <div className={"store-banner color-" + (i % 3)}>
        <span className="shop-icon">▥</span>
        <span className="store-tag">NEIGHBOURHOOD FAVOURITE</span>
      </div>
      <div className="store-content">
        <div className="store-score">
          <span className="stars">★ {score(s.rating)}</span>
          <small>
            {s.count} {s.count === 1 ? "rating" : "ratings"}
          </small>
        </div>
        <h3>{s.name}</h3>
        <p className="address">⌖ {s.address}</p>
        <p className="muted email">{s.email}</p>
        {user.role === "USER" && (
          <div className="rate-area">
            <span>
              {s.my_rating
                ? "Your rating · select to update"
                : "Been here? Leave a rating"}
            </span>
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  disabled={busy}
                  aria-label={`Rate ${s.name} ${v} stars`}
                  aria-pressed={s.my_rating === v}
                  className={v <= s.my_rating ? "selected" : ""}
                  onClick={() => onRate(s.id, v)}
                >
                  ★
                </button>
              ))}
              <small>
                {s.my_rating ? `${s.my_rating}/5` : "Your experience matters"}
              </small>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
