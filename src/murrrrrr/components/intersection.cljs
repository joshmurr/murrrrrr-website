(ns murrrrrr.components.intersection)

(defn observe-visibility [element callback]
  (when element
    (let [observer (js/IntersectionObserver.
                    (fn [entries _]
                      (if (> (.-intersectionRatio (first entries)) 0)
                        (callback true)
                        (callback false))))]
      (.observe observer element))))
