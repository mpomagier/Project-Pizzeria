import {settings,select} from '../settings.js';

class AmountWidget {

  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    const isNotANumber = isNaN(newValue);
    const isLessThanMin = newValue < settings.amountWidget.defaultMin;
    const isGreaterThanMax = newValue > settings.amountWidget.defaultMax;

    if (isNotANumber || isLessThanMin || isGreaterThanMax) {
      thisWidget.input.value = thisWidget.value;
      return;
    }

    thisWidget.value = newValue;
    thisWidget.input.value = thisWidget.value;

    if(thisWidget.value > settings.amountWidget.defaultMax) {
      thisWidget.input.value = settings.amountWidget.defaultMax;
      thisWidget.value = settings.amountWidget.defaultValue;

    }
    if(thisWidget.value < settings.amountWidget.defaultMin) {
      thisWidget.input.value = settings.amountWidget.defaultMin;
      thisWidget.value = settings.amountWidget.defaultValue;

    }

    thisWidget.announce();
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function() {
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function() {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function() {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });

    if(thisWidget.value === 0) {
      thisWidget.input.value = 1;
    }
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;