// initMap
let map;
let mapInit = false;
let autocomplete;
const list = document.querySelector('[data-is-map-list]');
const zoomResult = 16;

function initMap() {
    const svgMarker = {
        path: "M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z",
        fillColor: "#00CB93",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#000000",
        rotation: 0,
        scale: 0.75,
        anchor: new google.maps.Point(15, 30),
    };

    const initLatLng = (!isNaN(parseInt(is_map[0].latitude)) && !isNaN(parseInt(is_map[0].longitude))) ? { lat: parseInt(is_map[0].latitude), lng: parseInt(is_map[0].longitude) } : { lat: 43.7182412, lng: -79.3780581 };
    map = new google.maps.Map(
        document.querySelector('[data-is-map]'),
        {
            center: initLatLng,
            zoom: 11,
            clickableIcons: false,
        }
    );

    is_map.forEach(function(item) {
      if(!isNaN(item.latitude) && !isNaN(item.longitude)) {
        const marker = new google.maps.Marker({
            position: { lat: item.latitude, lng: item.longitude },
            map: map,
            icon: svgMarker,
            title: item.name
        });
        const info = new google.maps.InfoWindow({
          content: '<div data-is-map-infowindow>' + item.name + '</div>',
        });
        marker.addListener("click", () => {
            map.setZoom(zoomResult);
            map.setCenter(marker.getPosition());
            info.open({
              anchor: marker,
              map,
              shouldFocus: false,
            });
            const lat = marker.getPosition().lat();
            const lng = marker.getPosition().lng();
            const filteredList = is_map.filter(item => (item.latitude > lat - 0.003 && item.latitude < lat + 0.003) && (item.longitude > lng - 0.015 && item.longitude < lng + 0.015));
            buildPages(filteredList);
        });
      }
    });

    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('is_map_search'),
        {
            types: ['establishment'],
            componentRestrictions: {'country': ['CA']},
            fields: ['place_id', 'geometry', 'name'],
        }
    );

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        if (!place.geometry) {
            document.getElementById('is_map_search').value = '';
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(zoomResult);
        }
        
        const filteredList = is_map.filter(item => (item.latitude > lat - 0.003 && item.latitude < lat + 0.003) && (item.longitude > lng - 0.015 && item.longitude < lng + 0.015));
        buildPages(filteredList);
    });

    mapInit = true;
}

window.initMap = initMap;

function populateList(results, list, currentpage, pagination){
    list.empty();
    
    if (typeof results != undefined) {
        const total = results.length;
        const trimStart = currentpage * pagination;
        const trimEnd = (trimStart + pagination < total) ? trimStart + pagination : total;
        
        if (mapInit && typeof map.setCenter != undefined && typeof results[trimStart] != undefined && !isNaN(results[trimStart].latitude) && !isNaN(results[trimStart].longitude)) {
            map.setCenter(new google.maps.LatLng(results[trimStart].latitude, results[trimStart].longitude));
        }

        for (let i = trimStart; i < trimEnd; i++) {
            let x = document.createElement('div');
            x.setAttribute('data-is-map-list-item', 'true');
            if(typeof results[i].image != undefined) {
                x.innerHTML = "<div class=\"is-map__list-item__image\"><img src=\"" + results[i]['image'] + "\" alt=\"" + results[i].image_alt + "\" /></div><div class=\"is-map__list-item__info\"><h3 class=\"blog_title\">" + results[i].name + "</h3><p class=\"text-size-small text-style-allcaps\">" + results[i].category + "</p><p>" + results[i].address + "</p><p class=\"text-listing-discount\"><strong>" + results[i].discount + "</strong></p><div class=\"button_wrapper\"><a href=\"" + results[i].website + "\" target=\"_blank\" class=\"button w-button\">Visit Website</a></div></div></div>";
            }
            list.append(x);
            x.addEventListener('click', function handleClick(event) {
              if(!isNaN(results[i].latitude) && !isNaN(results[i].longitude)) {
                map.setCenter(new google.maps.LatLng(results[i].latitude, results[i].longitude));
                map.setZoom(zoomResult);
              }
            });
        }
    }
}

function buildPages(results, list = $('[data-is-map-list]')) {
		document.getElementById('is_map_search').value = '';
    if (typeof results != undefined) {
        const total = results.length;

        if (typeof list != undefined) {
            if(total > 0) {
                if (list.siblings('[data-is-pagination]').length == 0) {
                    list.parent().append('<div data-is-pagination></div>');
                }

                const pagination = !isNaN(parseInt(list.attr('data-is-map-paging'))) ? parseInt(list.attr('data-is-map-paging')) : 5;
                let currentpage = 0;
                const totalPages = Math.ceil(total/pagination) - 1;

                const pager = list.siblings('[data-is-pagination]');

                pager.empty();
                
                if (totalPages > 1) {
                    for (let i = currentpage; i <= ((currentpage + 2 < totalPages) ? currentpage + 2 : totalPages); i++) {
                        pager.append('<button class="active" data-is-paging="' + i + '">' + (i + 1) + '</button>');
                    }
                    
                    pager
                        .prepend('<button class="prev-btn ' + ((currentpage > 0) ? 'active' : '') + '" data-is-paging="0"><svg title="left arrow icon" width="73" height="24" viewBox="0 0 73 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.93934 10.9393C0.353553 11.5251 0.353553 12.4749 0.93934 13.0607L10.4853 22.6066C11.0711 23.1924 12.0208 23.1924 12.6066 22.6066C13.1924 22.0208 13.1924 21.0711 12.6066 20.4853L4.12132 12L12.6066 3.51471C13.1924 2.92893 13.1924 1.97918 12.6066 1.39339C12.0208 0.807607 11.0711 0.807606 10.4853 1.39339L0.93934 10.9393ZM73 10.5L2 10.5L2 13.5L73 13.5L73 10.5Z" fill="currentColor"></path></svg></button>')
                        .append('<button class="next-btn ' + ((currentpage < totalPages) ? 'active' : '') + '" data-is-paging="' + (currentpage + 1) + '"><svg title="right arrow icon" width="73" height="24" viewBox="0 0 73 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M72.0607 13.0607C72.6464 12.4749 72.6464 11.5251 72.0607 10.9393L62.5147 1.3934C61.9289 0.807611 60.9792 0.807611 60.3934 1.3934C59.8076 1.97919 59.8076 2.92893 60.3934 3.51472L68.8787 12L60.3934 20.4853C59.8076 21.0711 59.8076 22.0208 60.3934 22.6066C60.9792 23.1924 61.9289 23.1924 62.5147 22.6066L72.0607 13.0607ZM0 13.5L71 13.5V10.5L0 10.5L0 13.5Z" fill="currentColor"></path></svg></button>');

                    pager.children('button').click(function(){
                        currentpage = (!isNaN(parseInt($(this).attr('data-is-paging'))) ? parseInt($(this).attr('data-is-paging')) : 0);
                        list.attr('data-is-map-current', currentpage);
                        const prevButton = $(this).parent().children('[data-is-paging].prev-btn');
                        const nextButton = $(this).parent().children('[data-is-paging].next-btn');
                        if (currentpage - 1 < 0) {
                          prevButton.removeClass('active').attr('data-is-paging', 0);
                        } else {
                          prevButton.addClass('active').attr('data-is-paging', currentpage - 1);
                        }
                        if (currentpage >= totalPages) {
                          nextButton.removeClass('active').attr('data-is-paging', totalPages);
                        } else {
                          nextButton.addClass('active').attr('data-is-paging', currentpage + 1);
                        }
                        $(this).parent().children('[data-is-paging]:not(.prev-btn, .next-btn)').each(function(i) {
                          if (currentpage + i <= totalPages) {
                            $(this).attr('data-is-paging', currentpage + i).html(currentpage + i + 1).addClass('active');
                          } else {
                            $(this).attr('data-is-paging', totalPages).html(totalPages).removeClass('active');
                          }
                        });

                        populateList(results, list, currentpage, pagination);
                    }).first().click();
                } else {
                    pager.empty();
                    populateList(results, list, currentpage, pagination);
                }
            } else {
                list.html('No nearby places found.');
            }
        }
    }
}

$(function() {
    buildPages(is_map);
    if (is_map_categories.length > 0) {
        is_map_categories.unshift('Discount');
        is_map_categories.unshift('All');

        for (i = 0; i < is_map_categories.length; i++) {
            $('[data-is-map-filters]').prepend('<span class="guide_listings_form' + ((is_map_categories[i].trim().toLowerCase() === 'all') ? ' active' : '') + '" data-is-map-filter="' + encodeURI(is_map_categories[i].trim()).toLowerCase() + '">' + is_map_categories[i].trim() + '</span>');
        }
        
        let filters = $('[data-is-map-filter]');
        filters.click(function(){
            filters.removeClass('active');
            $(this).addClass('active');
            const cat = $(this).attr('data-is-map-filter').replace('&', '&amp;');
            switch (cat) {
                case 'all':
                    buildPages(is_map);
                    break;
                case 'discount':
                    buildPages(is_map.filter(item => typeof item.discount === "string" && item.discount.trim().length !== 0));
                    break;
                default:
                    buildPages(is_map.filter(item => encodeURI(item.category).toLowerCase() == cat));
            }
        });
    }
});