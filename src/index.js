const mainEl = document.querySelector('.main');
const cardsEl = document.querySelector('.cards');
const toggleModeEl = document.querySelector('.toggle-mode');
const searchEl = document.querySelector('.search');
const paginationEl = document.querySelector('.pagination');
const clearEl = document.querySelector('.clear');
const regionEl = document.querySelector('.region');
const currentPageContainerEl = document.querySelector(
  '.current-page-container'
);
const backEl = document.querySelector('.back');
const currentPageEl = document.querySelector('.current-page');
const itemEl = document.querySelector('.item');
const modeSvgEl = document.querySelector('.mode-svg');
const searchSvgEl = document.querySelector('.search-svg');
const backSvgEl = document.querySelector('.back-svg');

tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {},
  },
};

let allPage = 1;
let currentPage = 1;
const paginationNumber = 12;
let countryData;
let searchWords = '';
let region = 'All';
let currentData;

toggleModeEl.addEventListener('click', () => {
  mainEl.classList.toggle('dark');
  if (mainEl.classList.contains('dark')) {
    modeSvgEl.src = './src/sun-regular.svg';
    searchSvgEl.src = './src/search-white.svg';
    backSvgEl.src = './src/arrow-left-white.svg';
  } else {
    modeSvgEl.src = './src/moon-regular.svg';
    searchSvgEl.src = './src/search.svg';
    backSvgEl.src = './src/arrow-left.svg';
  }
});

searchEl.addEventListener('change', (e) => {
  searchWords = e.target.value;
  renderData();
});

regionEl.addEventListener('change', (e) => {
  region = e.target.value;
  currentPage = 1;
  renderData();
});

clearEl.addEventListener('click', () => {
  searchWords = '';
  searchEl.value = '';
  currentPage = 1;
  renderData();
});

backEl.addEventListener('click', () => {
  currentPageContainerEl.classList.add('hidden');
  itemEl.classList.remove('hidden');
});

async function getData() {
  try {
    const { data } = await axios.get('https://restcountries.com/v3.1/all');
    countryData = data;
    renderData();
  } catch (err) {
    console.log(err);
  }
}

function setPage() {
  let html = '';
  for (let i = 0; i < allPage; i++) {
    html += `<li class="page p-3 border mt-6 ${
      i === currentPage - 1 ? 'bg-green-500' : ''
    } hover:bg-blue-200">${i + 1}</li>`;
  }

  paginationEl.innerHTML = html;
}

function renderData() {
  let html;
  let filterData;
  let spliceData;
  if (countryData && !searchWords) {
    filterData = JSON.parse(JSON.stringify(countryData)).filter((object) => {
      if (region === 'All') {
        return object;
      }
      return object.region === region;
    });
    spliceData = filterData.splice(
      Math.abs(currentPage - 1) * paginationNumber,
      paginationNumber
    );
  } else if (countryData && searchWords) {
    const searchData = countryData.filter((object) => {
      return object.name.common.includes(searchWords);
    });
    filterData = searchData.filter((object) => {
      if (region === 'All') {
        return object;
      }
      return object.region === region;
    });
    spliceData = filterData.splice(
      Math.abs(currentPage - 1) * paginationNumber,
      paginationNumber
    );
    if (searchData.length === 0) {
      allPage = 0;
    }
  }
  html = spliceData.map((object) => {
    return `<div class="card mb-3 rounded-xl bg-white overflow-hidden 
    shadow-lg flex flex-col justify-between dark:bg-[#2b3743]">
    <img
      class="w-full"
      src="${object.flags.png}"
      alt="${object.name.common}"
    />
    <div class="p-7">
    <p class="mb-4 font-bold">${object.name.common}</p>
    <p class="mb-2">Population：${object.population}</p>
    <p class="mb-2">Region：${object.region}</p>
    <p>Capital：${object.capital}</p>
    </div>
  </div>`;
  });
  allPage = Math.round(filterData.length / paginationNumber);
  cardsEl.innerHTML = allPage === 0 ? 'Not find !' : html.join('');
  setPage();
  getPage();
  clickCard();
  window.scrollTo(0, 0);
}

function getPage() {
  const pagesEl = document.querySelectorAll('.page');
  pagesEl.forEach((pageEl, index) => {
    pageEl.addEventListener('click', (e) => {
      currentPage = index + 1;
      renderData();
      togglePageClass();
    });
  });
}

function togglePageClass() {
  const pagesEl = document.querySelectorAll('.page');
  pagesEl.forEach((pageEl, index) => {
    pageEl.classList.remove('bg-green-500');
    if (index === currentPage - 1) {
      pageEl.classList.add('bg-green-500');
    }
  });
}

function clickCard() {
  const cardAllEl = document.querySelectorAll('.card');
  cardAllEl.forEach((cardEl) => {
    cardEl.addEventListener('click', () => {
      currentData = countryData.filter(
        (object) =>
          object.name.common === cardEl.children[1].children[0].innerText
      );
      currentPageContainerEl.classList.remove('hidden');
      renderCurrentPage();
    });
  });
}

function renderCurrentPage() {
  const languagesKeys = Object.keys(currentData[0].languages)[0];
  const currencies = Object.keys(currentData[0].currencies)[0];
  const languages = Object.values(currentData[0].languages);
  const html = `
  <img src="${currentData[0].flags.png}" alt="${currentData[0].name.common}" />
  <div>
    <h2 class="font-bold mb-3">${currentData[0].name.common}</h2>
    <ul>
      <li class="mb-2">Native Name：${
        currentData[0].name.nativeName[languagesKeys].common
      }</li>
      <li class="mb-2">Population：${currentData[0].population}</li>
      <li class="mb-2">Region：${currentData[0].region}</li>
      <li class="mb-2">Sub Region：${currentData[0].subregion}</li>
      <li class="mb-2">Capital:${currentData[0].capital}</li>
      <li class="mb-2">Top Level Domain：${currentData[0].tld}</li>
      <li class="mb-2">Currencies：${currencies}</li>
      <li>Languages：${languages.join(',')}</li>
    </ul>
  </div>`;
  currentPageEl.innerHTML = html;
  itemEl.classList.add('hidden');
  window.scrollTo(0, 0);
}

getData();
