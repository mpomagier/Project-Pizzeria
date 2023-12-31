import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

    thisBooking.selectedTable = null;
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    // console.log('getData params', params);

    const urls = {
      bookings:
        settings.db.url +
        '/' +
        settings.db.booking +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsRepeat.join('&'),
    };

    //console.log('getData url',urls);
    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      const hourStr = utils.numberToHour(item.hour);

      thisBooking.makeBooked(item.date, hourStr, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      const hourStr = utils.numberToHour(item.hour);

      thisBooking.makeBooked(item.date, hourStr, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      //check is tableId is number
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        // is this table is available
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

    if (thisBooking.selectedTable) {
      thisBooking.selectedTable.classList.remove('selected');
    }

    thisBooking.selectedTable = null;
  }

  render(element) {
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );

    thisBooking.dom.bookTableButton = thisBooking.dom.wrapper.querySelector(
      '.booking-form button[type="submit"]'
    );
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );

    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});

    thisBooking.dom.datePicker.addEventListener('updated', function () {});

    thisBooking.dom.hourPicker.addEventListener('updated', function () {});

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', (event) => {
        thisBooking.selectTable(event);
      });
    }

    thisBooking.dom.bookTableButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  selectTable(event) {
    const thisBooking = this;

    const table = event.target;
    const tableId = table.getAttribute(settings.booking.tableIdAttribute);

    if (
      thisBooking.booked[thisBooking.date] &&
      thisBooking.booked[thisBooking.date][thisBooking.hour] &&
      thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
    ) {
      return;
    }

    if (table.classList.contains(classNames.booking.tableBooked)) {
      return;
    }

    if (thisBooking.selectedTable) {
      thisBooking.selectedTable.classList.remove(classNames.selected.table);
    }

    table.classList.add(classNames.selected.table);
    thisBooking.selectedTable = table;
    thisBooking.selectedTableId = tableId;
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hour,
      table: parseInt(thisBooking.selectedTableId),
      duration: parseInt(thisBooking.hoursAmountWidget.value),
      ppl: parseInt(thisBooking.peopleAmountWidget.value),
      starters: [],
      phone: thisBooking.dom.wrapper.querySelector(select.cart.phone).value,
      address: thisBooking.dom.wrapper.querySelector(select.cart.address).value,
    };

    const checkedStarters = thisBooking.dom.wrapper.querySelectorAll(
      'input[name="starter"]:checked'
    );

    for (let starter of checkedStarters) {
      payload.starters.push(starter.value);
    }

    if (payload.starters.includes('bread')) {
        payload.starters.push('water');
      }

    payload.starters = [...new Set(payload.starters)];

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(response => response.json())
      .then(parsedResponse => {

        const hourStr = utils.numberToHour(payload.hour);

        thisBooking.makeBooked(
          payload.date,
          hourStr,
          payload.duration,
          payload.table
        );

        console.log('Booking response:', parsedResponse);

        thisBooking.updateDOM();
      });

  }
}

export default Booking;
