(ns murrrrrr.components.animated-text
  (:require [reagent.core :as r]
            [clojure.string]
            [react]
            [murrrrrr.components.intersection :refer [observe-visibility]]))

(set! *warn-on-infer* true)

(defn- make-letter-els [sentence]
  (map-indexed (fn [i letter]
                 (let [el [:span {:key (str i letter)
                                  :class "letter"
                                  :style {:transition-delay (str (* 0.04 i) "s")}}
                           letter]]
                   el))
               sentence))

(defonce is-visible (r/atom false))

(defn ani-letters [words]
  [:div {:ref "container"
         :class (if @is-visible "visible" "hidden")}
   (make-letter-els words)])

(def show (fn [el visible]
            (js/console.log el visible)
            (if visible
              (reset! is-visible true)
              (reset! is-visible false))))

(def observed-letters
  (with-meta ani-letters
    {:component-did-mount (fn [^react/JSXElement this]
                            (let [^js/object c (.. this -refs -container)]
                              (observe-visibility c (partial show this))))}))

