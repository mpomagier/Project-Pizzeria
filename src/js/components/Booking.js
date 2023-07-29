import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    // Generate HTML based on template
    const generatedHTML = templates.bookingWidget();

    // Create empty object thisBooking.dom
    thisBooking.dom = {};

    // Add wrapper property to thisBooking.dom and assign it to element
    thisBooking.dom.wrapper = element;

    // Change content of wrapper to generatedHTML
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    // Add property thisBooking.dom.peopleAmount and assign it to wrapper element with class .people-amount
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.widgets.booking.peopleAmount);

    // Add property thisBooking.dom.hoursAmount and assign it to wrapper element with class .hours-amount
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.widgets.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    // Create new instance of AmountWidget class and assign it to thisBooking.peopleAmount property
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);

    // Create new instance of AmountWidget class and assign it to thisBooking.hoursAmount property
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
  }

}

export default Booking;