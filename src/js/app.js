/* eslint-disable no-undef */
App = {
  web3Provider: null,
  editor: null,
  editor2: null,
  editor3: null,
  celmco: 1,
  ondemsale: 0,
  label: 1,
  templatesCube: [],

  fillTemplatesCube: function () {
    const celStream = [];
    const celSale = [];
    const mcoStream = [];
    const mcoSale = [];

    celStream.push('../templates/cel/use-case-stream-big-label.xml');
    celStream.push('../templates/cel/use-case-stream-small-label.xml');
    celStream.push('../templates/cel/use-case-stream-no-label.xml');
    celSale.push('../templates/cel/use-case-download-big-label.xml');
    celSale.push('../templates/cel/use-case-download-small-label.xml');
    celSale.push('../templates/cel/use-case-download-no-label.xml');
    mcoStream.push('../templates/mco/use-case-stream-big-label.ttl');
    mcoStream.push('../templates/mco/use-case-stream-small-label.ttl');
    mcoStream.push('../templates/mco/use-case-stream-no-label.ttl');
    mcoSale.push('../templates/mco/use-case-download-big-label.ttl');
    mcoSale.push('../templates/mco/use-case-download-small-label.ttl');
    mcoSale.push('../templates/mco/use-case-download-no-label.ttl');

    const cel = [];
    cel.push(celStream);
    cel.push(celSale);
    const mco = [];
    mco.push(mcoStream);
    mco.push(mcoSale);

    App.templatesCube.push(cel);
    App.templatesCube.push(mco);
  },

  getTemplate: function (x, y, z) {
    return App.templatesCube[x][y][z];
  },

  init: async function () {
    App.fillTemplatesCube();
    const firstToDisplay = App.getTemplate(
      App.celmco,
      App.ondemsale,
      App.label
    );
    const data = await $.get(firstToDisplay);
    App.accounts = await $.getJSON('../accounts.json');

    App.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
      lineNumbers: true,
      mode: { name: 'text/turtle' },
      theme: 'base16-dark',
    });

    App.editor.setValue(data);
    App.editor.setSize(null, 500);

    App.editor2 = CodeMirror.fromTextArea(document.getElementById('editor2'), {
      lineNumbers: true,
      mode: { name: 'javascript', json: true },
      theme: 'base16-dark',
    });
    App.editor2.setValue(
      'Click on convert to generate Media Contractual Objects...'
    );
    App.editor2.setSize(null, 500);

    App.editor3 = CodeMirror.fromTextArea(document.getElementById('editor3'), {
      lineNumbers: true,
      mode: { name: 'javascript' },
      theme: 'base16-dark',
    });
    App.editor3.setValue('Prepare and then deploy the smart contract...');
    App.editor3.setSize(null, 500);

    App.utilsString();

    return App.initWeb3();
  },

  initWeb3: async function () {
    // Is there an injected web3 instance ?
    try {
      if (ethereum) {
        App.web3Provider = ethereum;
        ethereum.enable();
      } else {
        //// If no injected web3 instance is detected, fall back to Ganache
        App.web3Provider = new Web3.providers.HttpProvider(
          'http://localhost:8545'
        );
      }
      web3 = new Web3(App.web3Provider);
    } catch (error) {
      document.getElementById('metamask').style.display = 'block';
      document.getElementById('deploybtn').style.display = 'none';
      App.editor3.setValue('You need an Ethereum provider (Metamask)');
    }

    return App.bindEvents();
  },

  convertToMediaContractualObjects: async function () {
    try {
      event.preventDefault();

      const ttlContract = App.editor.getValue();
      const res = await $.ajax({
        type: 'POST',
        url: 'https://scm.linkeddata.es/api/parser/mco',
        contentType: 'text/plain; charset=utf-8',
        dataType: 'text',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/plain',
        },
        data: ttlContract,
      });

      App.editor2.setValue(JSON.stringify(JSON.parse(res), null, 2));
    } catch (error) {
      console.log(error);
      $('#cstatus').text('Contract Error!');
    }
  },

  bindEvents: function () {
    $(document).on(
      'click',
      '.btn-contract',
      App.convertToMediaContractualObjects
    );
    $(document).on('click', '.btn-refresh', App.handleUpload);
    $(document).on('click', '.btn-update', App.initContract);
    $(document).on('click', '.btn-case', App.setCase);
    $(document).on('click', '.btn-convert', App.generateSCMData);
  },

  generateSCMDataCEL: async function () {
    try {
      App.editor3.setValue(
        'Wait for a few seconds, while uploading the smart contract to the blockchain...'
      );
      const reqData = App.ondemsale * 3 + App.label;
      const res = await $.ajax({
        type: 'POST',
        url: 'http://localhost:5000',
        crossDomain: true,
        contentType: 'text/plain; charset=utf-8',
        dataType: 'text',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/plain',
        },
        data: reqData.toString(),
      });
      console.log(res);

      App.editor3.setValue(res);
    } catch (error) {
      console.log(error);
    }
  },

  generateSCMData: async function () {
    try {
      event.preventDefault();

      if (App.celmco === 0) {
        App.generateSCMDataCEL();
      } else {
        const ttlContract = App.editor.getValue();
        const res = await $.ajax({
          type: 'POST',
          url: 'https://scm.linkeddata.es/api/parser/mco',
          contentType: 'text/plain; charset=utf-8',
          dataType: 'text',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/plain',
          },
          data: ttlContract,
        });
        const contr = JSON.parse(res).contracts[0];

        //const res2 = { contractIdref: 'cont-9ppXJE8Ct0T0gi_FK26Q4u' };
        const res2 = await $.ajax({
          type: 'POST',
          url: 'https://scm.linkeddata.es/api/contracts/',
          contentType: 'application/json; charset=UFT-8',
          dataType: 'json',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          data: JSON.stringify(contr),
        });
        //console.log(res2);

        const res3 = await $.ajax({
          type: 'GET',
          url: `https://scm.linkeddata.es/api/eth/generate/${res2.contractIdref}`,
          crossDomain: true,
          headers: {
            Accept: 'application/json',
          },
        });
        //console.log(res3);

        App.editor3.setValue(JSON.stringify(res3, null, 2));
        document.getElementById('deploybtn').style.display = 'block';

        App.setBindings(res3);
        return App.setPies(res3);
      }
    } catch (error) {
      console.log(error);
    }
  },

  setPies(scmObjects) {
    var element = document.getElementById('pies');
    while (element.hasChildNodes()) {
      element.removeChild(element.lastChild);
    }
    for (const key in scmObjects.incomePercentage) {
      var tag = document.createElement('div');
      tag.style.width = '400px';
      tag.style.height = '400px';
      tag.setAttribute('class', 'col-sm-6');
      element.appendChild(tag);

      const dataArray = [['Beneficiary', 'Percentage']];
      let tot = 0;
      for (const benefKey in scmObjects.incomePercentage[key]) {
        dataArray.push([benefKey, scmObjects.incomePercentage[key][benefKey]]);
        tot += scmObjects.incomePercentage[key][benefKey];
      }
      tot = 100 - tot;
      if (tot < 0) {
        throw new Error('Percentages error');
      }
      dataArray.push([key, tot]);

      var data = google.visualization.arrayToDataTable(dataArray);

      var options = {
        legend: 'none',
        pieSliceText: 'label',
        title: `${key}`,
        pieHole: 0.4,
      };

      var chart = new google.visualization.PieChart(tag);
      chart.draw(data, options);
    }
  },

  setBindings(scmObjects) {
    var element = document.getElementById('bindingsForm');
    while (element.hasChildNodes()) {
      element.removeChild(element.lastChild);
    }
    let accountIndex = 0;
    for (const key in scmObjects.parties) {
      /*
          <div class="form-group row">
            <label for="colFormLabelSm" class="col-sm-2 col-form-label col-form-label-sm">Email</label>
            <div class="col-sm-10">
              <input type="email" class="form-control form-control-sm" id="colFormLabelSm" placeholder="col-form-label-sm">
            </div>
          </div>
      */
      var div = document.createElement('div');
      div.setAttribute('class', 'form-group row');
      var label = document.createElement('label');
      label.setAttribute('for', 'colFormLabelSm');
      label.setAttribute('class', 'col-sm-2 col-form-label col-form-label-sm');
      label.innerHTML = key;
      var div2 = document.createElement('div');
      div2.setAttribute('class', 'col-sm-10');
      var input = document.createElement('input');
      input.setAttribute('type', 'name');
      input.setAttribute('class', 'form-control form-control-sm');
      input.setAttribute('value', App.accounts[accountIndex]);
      div2.appendChild(input);
      div.appendChild(label);
      div.appendChild(div2);
      element.appendChild(div);

      accountIndex = (accountIndex + 1) % 10;
    }
  },

  handleUpload: async function (event) {
    event.preventDefault();

    const bindings = {};
    for (
      let i = 0;
      i < document.getElementById('bindingsForm').childNodes.length;
      i++
    ) {
      bindings[
        document.getElementById('bindingsForm').childNodes[i].textContent
      ] = document.getElementById('bindingsForm').elements[i].value;
    }

    const mediaSC = JSON.parse(App.editor3.getValue());

    try {
      $('#mcoup').text('Uploading MCO Contract...');

      const networkId = await App.web3Provider.request({
        method: 'net_version',
      });

      const ipfs = new EthSCM.OffChainStorage();
      const deployer = new EthSCM.SmartContractDeployer(
        App.web3Provider,
        ipfs,
        mediaSC,
        bindings,
        networkId
      );
      await deployer.setMainAddress(0);
      const res = await deployer.deploySmartContracts();
      const contractAddress = res.options.address;
      console.log(contractAddress);
      document.getElementById('deploybtn').style.display = 'block';
      $('#mcoup').text('Deployed!');
      $('#clinkMain').text(
        'https://ropsten.etherscan.io/address/' + contractAddress
      );
      $('#clinkMain').attr(
        'href',
        'https://ropsten.etherscan.io/address/' + contractAddress
      );
    } catch (error) {
      console.log(error);
    }
  },

  setCase: async function (event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));

    switch (petId) {
      case 0:
        App.celmco = 0;
        break;
      case 1:
        App.celmco = 1;
        break;
      case 2:
        App.ondemsale = 0;
        break;
      case 3:
        App.ondemsale = 1;
        break;
      case 4:
        App.label = 0;
        break;
      case 5:
        App.label = 1;
        break;
      case 6:
        App.label = 2;
        break;
      default:
        break;
    }

    const jsonFile = App.getTemplate(App.celmco, App.ondemsale, App.label);
    console.log(jsonFile);
    var data = await $.get(jsonFile);
    if (App.celmco === 0) {
      data = new XMLSerializer().serializeToString(data);
    }
    App.editor.setValue(data);
  },

  utilsString: function () {
    if (!String.prototype.format) {
      String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
          return typeof args[number] != 'undefined' ? args[number] : match;
        });
      };
    }
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});

$('form').keypress(function (e) {
  //Enter key
  if (e.which == 13) {
    return false;
  }
});
