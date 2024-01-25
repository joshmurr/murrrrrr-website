(ns murrrrrr.components.animated-text
  (:require [reagent.core :as r]
            [clojure.string]
            [react]
            [murrrrrr.components.observe :refer [observe-visibility]]
            [murrrrrr.utils :refer [update-css! augment-self-on-mount]]
            ["@geomm/maths" :refer (matFromTransformations)]))

(set! *warn-on-infer* false)

(defn- mat-to-string [mat]
  (str "matrix3d(" (clojure.string/join ", " mat) ")"))
(defn mod-p-3 [i]
  (mod (mod i 3) 2))
(defn letter-mat [i]
  (mat-to-string (matFromTransformations
                  (clj->js {:translation [-15 8 0]
                            :rotation {:axis [(mod-p-3 i) (mod-p-3 (+ i 1)) (mod-p-3 (+ i 2))]
                                       :angle (* Math/PI 0.2)}
                            :scale [1 1 1]}))))

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
  (let [letters (make-letter-els words)
        aug-letters (doall (map #(augment-self-on-mount % (fn [el]
                                                            (print el)
                                                            (update-css! el :--color "green")
                                                            (update-css! el :--letter-mat (letter-mat 1)))) letters))]
    [:div {:ref "container"
           :class ["animated" (if @is-visible "visible" "hidden")]}
     letters]))

(def observed-letters
  (augment-self-on-mount ani-letters (fn [container]
                                       (observe-visibility container show)
                                       (update-css! container :--color "blue"))))

