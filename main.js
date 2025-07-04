// ใส่ ID ของ Google Sheets ของคุณที่นี่
const SHEET_ID = '1Ewr0XkjBNIEaCEAbggMYXJda9XQYr7iZCxzO5i4ilW4';
const SHEET_NAME = 'Press_Release'; // เปลี่ยนชื่อ Sheet ตามที่คุณใช้

function formatDate(dateStr) {
    try {
        if (typeof dateStr === 'string' && dateStr.startsWith('Date(')) {
            const values = dateStr.replace('Date(', '').replace(')', '').split(',');
            const date = new Date(values[0], values[1], values[2]);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return "-";
    } catch (error) {
        console.error('Error formatting date:', error);
        return "-";
    }
}

let allNews = [];
let currentPage = 1;
const itemsPerPage = 10;

function renderPagination(totalPages) {
    const container = document.getElementById('news-container');
    let pagination = document.getElementById('pagination');
    if (pagination) pagination.remove();
    pagination = document.createElement('div');
    pagination.id = 'pagination';
    pagination.style.textAlign = 'center';
    pagination.style.margin = '18px 0 10px 0';
    // ปุ่มอ่านข่าวทั้งหมด
    const allBtn = document.createElement('a');
    allBtn.textContent = 'อ่านข่าวทั้งหมด';
    allBtn.className = 'page-btn all-news-btn';
    allBtn.href = '#'; // เปลี่ยนลิงก์นี้เป็นหน้าข่าวทั้งหมดถ้ามี
    pagination.appendChild(allBtn);
    container.after(pagination);
}

function displayNews() {
    const container = document.getElementById('news-container');
    container.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageNews = allNews.slice(start, end);
    let tableHtml = `<table class="news-table no-header"><tbody>`;
    pageNews.forEach(item => {
        tableHtml += `<tr>
            <td class="date-cell">${formatDate(item.date)}</td>
            <td class="title-cell">${item.link ? `<a href="${item.link}" target="_blank" rel="noopener">${item.title || '-'}</a>` : (item.title || '-')}</td>
        </tr>`;
    });
    tableHtml += '</tbody></table>';
    container.innerHTML = tableHtml;
    renderPagination(Math.ceil(allNews.length / itemsPerPage));
}

async function fetchNews() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        allNews = json.table.rows.map(row => ({
            date: row.c[0]?.v,
            title: row.c[1]?.v,
            link: row.c[2]?.v
        }));
        currentPage = 1;
        displayNews();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchNews);

// เพิ่ม active class ให้ tab ปัจจุบัน
const tabLinks = document.querySelectorAll('#mainTabs .nav-link');
tabLinks.forEach(link => {
    if (window.location.pathname.endsWith(link.getAttribute('href'))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
    }
});
