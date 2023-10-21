(ns murrrrrr.components.observe)

(defn observe-visibility
  ([element callback] (observe-visibility element callback false))
  ([element callback trigger-once?]
   (when element
     (let [observer (js/IntersectionObserver.
                     (fn [entries _]
                       (if (> (.-intersectionRatio (first entries)) 0)
                         (callback true)
                         (when-not trigger-once? (callback false)))))]
       (.observe observer element)))))
