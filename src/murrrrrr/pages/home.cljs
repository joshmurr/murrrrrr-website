(ns murrrrrr.pages.home
  (:require
   [murrrrrr.components.full-screen :refer [full-screen]]
   [murrrrrr.components.animated-text :refer [observed-letters]]))

(defn home-page []
  [:div.page
   ; [background-container]
   ; [ani-letters "Hello, I'm a web developer."]
   [full-screen]
   [:div
    [observed-letters  "Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis."]]])
