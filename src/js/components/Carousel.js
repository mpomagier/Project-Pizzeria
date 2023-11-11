import Flickity from 'flickity';

class Carousel {
    constructor(element) {
      this.element = element;
      this.initFlickity();
    }

    initFlickity() {
      // Inicjalizacja Flickity
      this.flickity = new Flickity(this.element, {
        // Opcje Flickity
        wrapAround: true,
        pageDots: false,
      });
    }

    renderItems(items) {
      // Renderowanie elementów karuzeli za pomocą Handlebars
      const template = Handlebars.compile(document.querySelector('#template-quote-widget').innerHTML);
      items.forEach(item => {
        const html = template(item);
        this.element.insertAdjacentHTML('beforeend', html);
      });
      this.flickity.reloadCells(); // Odświeżanie Flickity po dodaniu nowych elementów
    }
  }
export default Carousel;