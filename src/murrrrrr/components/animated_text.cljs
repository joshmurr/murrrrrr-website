(ns murrrrrr.components.animated-text
  (:require [reagent.core :as r]
            ["@geomm/maths" :refer (identityMat matFromTransformations)]
            [clojure.string]
            [react]
            [murrrrrr.utils :refer [update-root-css]]
            [murrrrrr.components.intersection :refer [observe-visibility]]))

(defonce hidden-mat (matFromTransformations
                     #js {"translation" #js [0 24 0],
                          "rotation" #js {"axis" #js [0 0 0]
                                          "angle" 0}
                          "scale" #js [1 1 1]}))
(defonce visible-mat (identityMat))
(def current-mat (r/atom {:toggle false
                          :mat (identityMat)}))

(defn- mat-to-string [mat]
  (str "matrix3d(" (clojure.string/join ", " mat) ")"))

(defn- make-letter-els [sentence]
  (map-indexed (fn [i letter]
                 (let [el [:span {:key (str i letter)
                                  :class "letter"
                                  :style {:transition-delay (str (* 0.04 i) "s")}}
                           letter]]
                   el))
               sentence))

(defn ani-letters [words]
  (let [visible true]
    [:div {:ref "container"}
     (make-letter-els words)]))

(set! *warn-on-infer* true)

(def show (fn [visible]
            (if visible
              (do
                (println "visible")
                (update-root-css (.-documentElement js/document) :--mat (mat-to-string visible-mat))
                (update-root-css (.-documentElement js/document) :--op 1))
              (do
                (println "not visible")
                (update-root-css (.-documentElement js/document) :--mat (mat-to-string hidden-mat))
                (update-root-css (.-documentElement js/document) :--op 0)))))

(def observed-letters
  (with-meta ani-letters
    {:component-did-mount (fn [^react/JSXElement this]
                            (let [^js/HTMLElement c (.. this -refs -container)]
                              (observe-visibility c show)))}))

