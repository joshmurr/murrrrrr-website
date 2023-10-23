(ns murrrrrr.components.animated-text
  (:require [reagent.core :as r]
            [clojure.string]
            [react]
            [murrrrrr.components.observe :refer [observe-visibility]]))

(set! *warn-on-infer* false)

(defn- make-letter-els [sentence]
  (map-indexed (fn [i letter]
                 (let [el ^{:key i} [:span {:key i
                                            :class "letter"
                                            :style {:transition-delay (str (+ (* 0.02 i) (* (Math/sin i) 0.05)) "s")}}
                                     letter]]
                   el))
               sentence))

(defonce is-visible (r/atom false))

(def show (fn [visible]
            (if visible
              (reset! is-visible true)
              (reset! is-visible false))))

(defn ani-letters [words]
  [:div {:ref "container"
         :class ["animated" (if @is-visible "visible" "hidden")]}
   (make-letter-els words)])

(def observed-letters
  (with-meta ani-letters
    {:component-did-mount (fn [^react/JSXElement this]
                            (let [c (.. this -refs -container)]
                              (observe-visibility c show true)))}))

