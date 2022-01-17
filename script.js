var doJqueryAction = {
    getVars: function() {
        "use strict";
        this.accordion = $(".accordion");
        this.accordionSlide = $(".accordion__slide");
        this.standardForm = $(".standard-form");
        this.navWrapper = $(".navigation-wrapper");
        this.navBasket = $(".navigation-wrapper .basket");
        this.navClose = $(".navigation-wrapper .menu-close");
        this.navLinks = $(".navigation-wrapper .navigation-links");
    },
    init: function() {
        "use strict";
        this.getVars();
        this.tilesCheck();
        this.videoInit();
        this.validateForm();
        this.googleMaps();
        this.navHeight();
        this.doForms();
        this.doNews();
        this.doBasket();
        this.doShowcase();
    },
    doShowcase: function() {
        function showcasePaginate() {
            $(".showcase-grid")
                .find("a.prev")
                .remove();
            if ($(".showcase-grid").find("a.next").length > 0) {
                var next = $(".showcase-grid").find("a.next");
                var offset = next.data("offset");
                var filter = next.data("filter");
                next
                    .after(
                        '<a class="button--load-more" data-offset="' +
                            offset +
                            '" data-filter="' +
                            filter +
                            '">Load more</a>'
                    )
                    .remove();
            }
        }
        $(document).on("click", ".filter-list-reset", function(e) {
            e.preventDefault();
            var url = "/embeds/papers/";
            window.history.pushState(null, null, "/paper-showcase");
            $(".showcase-grid")
                .children()
                .fadeOut(400)
                .promise()
                .then(function() {
                    $(".papers-loading").css("display", "block");
                    $(".showcase-grid").empty();
                });
            $.ajax({
                type: "GET",
                url: url
            }).done(function(html) {
                $(".papers-loading").css("display", "none");
                this.$OuterDiv = $(html)
                    .hide()
                    .appendTo($(".showcase-grid"))
                    .fadeIn(400);
                showcasePaginate();
            });
        });
        $(".filter-list__list").on("click", "a", function(e) {
            e.preventDefault();
            var filter = $(this).data("filter");
            var title = $(this).data("title");
            var url = "/embeds/papers/?filter=" + filter;
            //window.history.pushState(null, null, '/paper-showcase?filter=' + title);
            window.history.pushState(null, null, "/paper-showcase");
            $(".showcase-grid")
                .children()
                .fadeOut(400)
                .promise()
                .then(function() {
                    $(".papers-loading").css("display", "block");
                    $(".showcase-grid").empty();
                });
            $.ajax({
                type: "GET",
                url: url
            }).done(function(html) {
                $(".papers-loading").css("display", "none");
                this.$OuterDiv = $(html)
                    .hide()
                    .appendTo($(".showcase-grid"))
                    .fadeIn(400);
                showcasePaginate();
            });
        });
        $(document).on("click", ".grid-item__link .background", function(e) {
            if (e.target == this) {
                // only if the target itself has been clicked
                $(this)
                    .siblings("figcaption")
                    .find(".button--view-slides")
                    .click();
            }
        });
        $(document).on("click", ".button--view-slides", function(e) {
            e.preventDefault();
            var files = JSON.parse("[" + $(this).data("slides") + "]");
            var srcset = [];
            for (i = 0; i < files.length; i++) {
                srcset.push({
                    src: files[i],
                    thumb: files[i]
                });
            }
            $(this).lightGallery({
                dynamic: true,
                dynamicEl: srcset,
                controls: true,
                download: false
            });
        });

        showcasePaginate();
        $(".showcase-grid").on("click", ".button--load-more", function(e) {
            e.preventDefault();
            var button = $(this);
            var offset = $(this).data("offset");
            var filter = $(this).data("filter");
            var url = "/embeds/papers/?filter=" + filter + "&offset=" + offset;
            $(this).attr("title", offset);
            $(".showcase-paginate").remove();
            $.ajax({
                type: "GET",
                url: url
            }).done(function(html) {
                this.$OuterDiv = $(html)
                    .hide()
                    .insertAfter($(".showcase-grid > ul:last-of-type"))
                    .fadeIn(800);
                showcasePaginate();
            });
        });
    },
    doBasket: function() {
        $(".iconlist__link")
            .filter(".iconlist__link--red")
            .append('<span class="icon"></span>')
            .addClass("iconlist__link--red--ajax");
        $(".panel__aside").on("click", ".iconlist__link--red--ajax", function(
            e
        ) {
            e.preventDefault();
            $(".menu-button").removeClass("menu-button--fadein");
            var link = this,
                href = $(this).attr("href"),
                alt = $(this).attr("data-alt"),
                basketAction,
                basketText;

            if ($(this).hasClass("iconlist__link--add")) {
                basketAction = "remove";
                basketText = "Remove sample from basket";
            } else if ($(this).hasClass("iconlist__link--remove")) {
                basketAction = "add";
                basketText = "Order Samples<br> Add to my basket";
            }

            $.ajax({
                type: "GET",
                url: href
            }).done(function(html) {
                $(".basket-notify").remove();
                // update basket value
                $.ajax({
                    type: "GET",
                    url: "/embeds/basket"
                }).done(function(html) {
                    $(".order-count").remove();
                    $(".basket__inner-center").after(html);

                    // $('.basket-notify').remove();
                    var count = $(".order-count").text();
                    if (parseInt(count) > 0) {
                        var counter = $(
                            '<span class="basket-notify">' + count + "</span>"
                        );
                        $(counter).hide();
                        $(".menu-button")
                            .append(counter)
                            .addClass("menu-button--fadein");
                        $(counter)
                            .fadeIn(200)
                            .delay(3000)
                            .fadeOut(600);
                    }
                    // $('.menu-button').append('<span class="basket-notify">1</span>').find('.basket-notify').delay(2000).fadeOut('slow');
                });
                // animate menu style

                // update text and classes
                if (basketAction == "add") {
                    $(link)
                        .removeClass("iconlist__link--remove")
                        .addClass("iconlist__link--add");
                } else if (basketAction == "remove") {
                    $(link)
                        .removeClass("iconlist__link--add")
                        .addClass("iconlist__link--remove");
                }
                $(link)
                    .find("span:not(.icon)")
                    .addClass("opacify");
                setTimeout(function() {
                    // Do something after 5 seconds
                    $(link)
                        .find("span:not(.icon)")
                        .html(basketText)
                        .removeClass("opacify");
                }, 500);
                $(link)
                    .attr("href", alt)
                    .attr("data-alt", href);
            });

            // alert(href);
        });
    },
    accordionClick: function(itemClicked) {
        // var self = this;
        "use strict";
        this.accordion = $(".accordion");
        var accordSetting = itemClicked.closest(this.accordion).data("setting");
        if (accordSetting === "single") {
            this.accordion.find(".active").removeClass("active");
            this.accordion.find(".visible").removeClass("visible");

            itemClicked.toggleClass("active");
            itemClicked.next(this.accordionSlide).toggleClass("visible");
        } else {
            itemClicked.toggleClass("active");
            itemClicked.next(this.accordionSlide).toggleClass("visible");
        }
    },
    navClick: function() {
        $(".menu-button").toggleClass("active", "inactive");
        $(".mobile-menu-icon").toggleClass("active", "inactive");
        $(".search-wrapper").removeClass("active", "inactive");
        $(".navigation-wrapper").toggleClass("active", "inactive");
        $(".mobileFade").fadeToggle();
    },
    searchClick: function() {
        $(".menu-button").removeClass("active", "inactive");
        $(".mobile-menu-icon").removeClass("active", "inactive");
        $(".search-wrapper").addClass("active", "inactive");
        $(".navigation-wrapper").removeClass("active", "inactive");
        $(".mobileFade").removeClass();
    },
    navHeight: function() {
        var windowHeight = $(window).height();
        var navBasketHeight = this.navBasket.outerHeight();
        var navCloseHeight = this.navClose.outerHeight();
        var navLinksHeight = this.navLinks.outerHeight();
        var navMainHeight = navBasketHeight + navCloseHeight + navLinksHeight;
        if (windowHeight <= navMainHeight) {
            this.navWrapper.addClass("tooshort");
        } else if (windowHeight > navMainHeight) {
            this.navWrapper.removeClass("tooshort");
        }
        $(".lt-ie9 .home-hero__content").css("height", windowHeight);
        // $('.lt-ie9 body.home').css('padding-top',windowHeight);
    },
    /*homepageSlider: function(){
    	if($(window).width() > 768){
    		visibleSize = 2;

            $('.homepage-slider').cycle({
                carouselVisible : 2
            });

    	}else{
    		visibleSize = 1;
            $('.homepage-slider').cycle({
                carouselVisible : 1
            });

    	}
    },
    homepageSliderReint: function(visibleSize){

		$('.homepage-slider').data('cycle-carousel-visible',visibleSize);
		$('.homepage-slider').cycle('reinit');


    }, */
    googleMaps: function() {
        function initialize() {
            var styles = [
                {
                    featureType: "landscape",
                    stylers: [{ hue: "#28eaba" }, { saturation: 26 }]
                },
                {
                    featureType: "poi",
                    stylers: [{ hue: "#0ead86" }]
                },
                {
                    featureType: "road.local",
                    stylers: [{ saturation: -100 }]
                },
                {
                    featureType: "road.arterial",
                    stylers: [{ saturation: -100 }]
                },
                {
                    featureType: "water",
                    stylers: [
                        { hue: "#0ead86" },
                        { invert_lightness: true },
                        { lightness: 20 }
                    ]
                }
            ];

            // Create a new StyledMapType object, passing it the array of styles,
            // as well as the name to be displayed on the map type control.
            var styledMap = new google.maps.StyledMapType(styles, {
                name: "Styled Map"
            });

            // Create a map object, and include the MapTypeId to add
            // to the map type control.
            var mapOptions = {
                disableDefaultUI: true,
                navigationControl: true,
                scrollwheel: true,
                zoom: 16,
                center: new google.maps.LatLng(51.2958328, -1.0692614),
                streetViewControl: false,
                navigationControlOptions: {
                    position: google.maps.ControlPosition.TOP_LEFT
                },
                zoomControlOptions: {
                    position: google.maps.ControlPosition.TOP_LEFT
                },

                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.ROADMAP, "map_style"]
                }
            };

            var map = new google.maps.Map(
                document.getElementById("map_canvas"),
                mapOptions
            );

            //Associate the styled map with the MapTypeId and set it to display.
            map.mapTypes.set("map_style", styledMap);
            map.setMapTypeId("map_style");
            
            var image = new google.maps.MarkerImage(
                "/_assets/img/pointer.png",
                new google.maps.Size(100, 83), // size
                new google.maps.Point(0, 0), // origin
                new google.maps.Point(23, 70) // anchor
            );

            var shadow = new google.maps.MarkerImage(
                "/_assets/img/pointer.png",
                new google.maps.Size(100, 83), // size
                new google.maps.Point(0, 0), // origin
                new google.maps.Point(50, 83) // anchor
            );

            var myLatLng = new google.maps.LatLng(51.2958328, -1.0692614);

            var beachMarker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                shadow: shadow,
                icon: image
            });
        }
        //runs the GMAPS function if the map-canvas div exisists
        if ($("#map_canvas").size() > 0) {
            initialize();
        }
    },
    doNews: function() {
        var page, pages, next;
        function doPaginate() {
            page = $(".newsPaginate").data("index");
            pages = $(".newsPaginate").data("total");
            next = $(".newsPaginate").data("next");
            if (page < pages)
                $(".newsPaginate").html(
                    '<a href="" class="button--load-more">Load more</a>'
                );
            else $(".newsPaginate").remove();
        }
        doPaginate();
        $(".grid").on("click", ".button--load-more", function(e) {
            e.preventDefault();
            var url = "/embeds/news/" + next;
            var self = this;
            $.ajax({
                type: "GET",
                url: url
            }).done(function(html) {
                $(".newsPaginate:eq(0)").remove();
                this.$OuterDiv = $(html)
                    .hide()
                    .insertAfter($(".final-grid").find("ul:last-of-type"))
                    .fadeIn(800);
                // .after(html);
                // $('.newsPaginate').remove();
                doPaginate();
                $(".module").each(function(i, el) {
                    var el = $(el);
                    if (el.visible(true)) {
                        el.addClass("already-visible");
                    }
                });

                $(window).scroll(function(event) {
                    $(".module").each(function(i, el) {
                        var el = $(el);
                        if (el.visible(true)) {
                            el.addClass("come-in");
                        }
                    });
                });
            });
            // $('.final-grid').find('ul:last-of-type').
        });
    },
    doForms: function() {
        $(".addItem").on("click", function() {
            var $title = $(this).data("title");
            // alert($title + ' is already in your basket');
            sweetAlert($title + " is already in your basket", null, "warning");
        });

        function trackConv(google_conversion_id, google_conversion_label) {
            var image = new Image(1, 1);
            image.src =
                "//www.googleadservices.com/pagead/conversion/" +
                google_conversion_id +
                "/?label=" +
                google_conversion_label +
                "&script=0";
        }

        // $('a.iconlist__link--add').click(function(e) {
        //     if ($(this).attr('disabled') == 'disabled') {
        //         e.preventDefault();
        //     }
        //     $(this).attr('disabled', 'disabled');
        // });

        var $form = $(".standard-form--order");
        var $clearAll = $form.attr("data-reset");
        var $generalErrors = $(".general_errors");

        $form.submit(function(e) {
            //hide all errors
            $(".error_message")
                .hide()
                .html("");
            $generalErrors.hide().html("");
            var self = this;
            //jquery ajax shortcut
            $.post(
                //form url (Freeform autodetects ajax)
                $form.attr("action"),
                //form params
                $form.serialize(),
                //data handler
                function(data) {
                    if (data.success == false) {
                        sweetAlert(
                            "Not all required fields were completed",
                            null,
                            "warning"
                        );
                        sweetAlert({
                            title: "Error",
                            text: "Not all required fields were completed",
                            confirmButtonText: "Return to form",
                            allowOutsideClick: true,
                            confirmButtonColor: "#0ead86"
                        });
                        //data.errors
                        $.each(data.errors, function(i, item) {
                            var $errorHolder = $('[name="' + i + '"]')
                                .parent()
                                .find(".error_message");
                            var error = $.isArray(item)
                                ? item.join("<br/>")
                                : item;

                            $('[name="' + i + '"]').addClass("error");
                        });
                    } else if (data.success) {
                        trackConv(991877907, "ETMWCM6eimAQk7b72AM");
                        var jqxhr = $.get($clearAll, function() {
                            sweetAlert(
                                "Thank you for your order",
                                null,
                                "success"
                            );
                            sweetAlert(
                                {
                                    title: "Thank you",
                                    text:
                                        "Thank you for your order, you should receive your order in just a few days.",
                                    type: "success",
                                    confirmButtonText:
                                        "Click to return to home page",
                                    allowOutsideClick: true,
                                    confirmButtonColor: "#0ead86"
                                },
                                function() {
                                    window.location.href = $clearAll;
                                    // window.location.href = '/';
                                }
                            );
                        });
                    }
                }
            );

            e.preventDefault();
            return false;
        });

        var $contactForm = $(".standard-form--contact");

        $contactForm.submit(function(e) {
            e.preventDefault();
            //hide all errors
            $(".error_message")
                .hide()
                .html("");
            $generalErrors.hide().html("");
            var self = this;
            //jquery ajax shortcut
            $.post(
                //form url (Freeform autodetects ajax)
                $contactForm.attr("action"),
                //form params
                $contactForm.serialize(),
                //data handler
                function(data) {
                    if (data.success == false) {
                        sweetAlert(
                            "Not all required fields were completed",
                            null,
                            "warning"
                        );
                        sweetAlert({
                            title: "Error",
                            text: "Not all required fields were completed",
                            confirmButtonText: "Return to form",
                            allowOutsideClick: true,
                            confirmButtonColor: "#0ead86"
                        });
                        //data.errors
                        $.each(data.errors, function(i, item) {
                            var $errorHolder = $('[name="' + i + '"]')
                                .parent()
                                .find(".error_message");
                            var error = $.isArray(item)
                                ? item.join("<br/>")
                                : item;

                            $('[name="' + i + '"]').addClass("error");
                        });
                    } else if (data.success) {
                        $(
                            ".modal--overlay, .modal--overlay__modal"
                        ).toggleClass("modal--closed");
                        var jqxhr = $.get($clearAll, function() {
                            sweetAlert(
                                "Thank you for your enquiry",
                                null,
                                "success"
                            );
                            sweetAlert(
                                {
                                    title: "Thank you",
                                    text:
                                        "Thank you for your enquiry, we will be in touch shortly",
                                    type: "success",
                                    allowOutsideClick: true,
                                    confirmButtonColor: "#0ead86"
                                },
                                function() {
                                    $($contactForm)
                                        .find("input,textarea")
                                        .val("");
                                }
                            );
                        });
                    }
                }
            );

            e.preventDefault();
            return false;
        });
    },
    validateForm: function() {
        $(".standard-form").validate({
            errorPlacement: function(error, element) {
                error.appendTo(element.parent("div")).css({ display: "none" });
            },
            messages: {
                name: "please enter your name",
                email: {
                    required: "We need your email address to contact you",
                    email: "Please enter a vaild email address."
                }
            }
        });
    },

    videoInit: function() {
        $(".video").fitVids();
    },

    tilesCheck: function() {
        var self = this;
        var fillerDiv01 =
            '<div class="cols--tight__col--34 tile-wrapper product-tile filler filler--01"><div class="product-tile__text-wrapper"><div class="product-tile__inner"><div class="product-tile__text-wrapper"><div class="product-tile__title">Did you know?</div><div class="product-tile__text">The paper presses as Arjo Wiggins weight fifty billions tonnes each.</div></div></div></div></div>';
        var fillerDiv02 =
            '<div class="cols--tight__col--56 tile-wrapper product-tile filler filler--02"><div class="product-tile__text-wrapper"><div class="product-tile__inner"><div class="product-tile__text-wrapper"><div class="product-tile__title">Sale/Promo</div><div class="product-tile__text">Something about a paper which is on sale and really good value maybe?</div></div></div></div></div>';

        $(".cols--tight").each(function() {
            var numb = $(this)
                .children()
                .size();
            if (numb < 3)
                numb == 1
                    ? $(this).append(fillerDiv01 + fillerDiv02)
                    : $(this).append(fillerDiv02);
        });
    }
};

$(function() {
    doJqueryAction.init();

    $(window).load(function() {
        $(".home-hero__content").addClass("active");
    });

    $('input[type="range"]').rangeslider({
        // Feature detection the default is `true`.
        // Set this to `false` if you want to use
        // the polyfill also in Browsers which support
        // the native <input type="range"> element.
        polyfill: false,

        // Default CSS classes
        rangeClass: "rangeslider",
        fillClass: "rangeslider__fill",
        handleClass: "rangeslider__handle",

        // Callback function
        onInit: function() {},

        // Callback function
        onSlide: function(position, value) {},

        // Callback function
        onSlideEnd: function(position, value) {
            doAjax();
        }
    });

    $("input[type=checkbox]").each(function() {
        var thisVal = $(this).val();
        var thisId = $(this).prop("id");
        var thisName = $(this).prop("name");
        var thisCheck = $(this).prop("checked");

        $(this).before(
            '<a href="" rel="' +
                thisId +
                '" class="checkbox" data-value="' +
                thisVal +
                '">Check</a>'
        );

        if (thisCheck === true) {
            $(this)
                .prev("a")
                .addClass("active");
        } else {
            $(this).val("");
        }

        $(this).prop("type", "hidden");
    });

    var fields = [
        "product_printing_recs",
        "product_finish",
        "product_materials",
        "product_suitability",
        "product_certifications",
        "product_whiteness"
    ];

    doAjax = function() {
        var search = [];
        var url = window.location.origin + "/embeds/products?";
        $('input[name="category[]"]').each(function() {
            if ($(this).val() !== "") search.push($(this).val());
        });
        if (search.length > 0) url += "category=" + search.join("|");
        var product_recycled = $("#product_recycled").val();
        url += "&range-from:product_recycled=" + product_recycled;
        $(".ajax-container").load(url, function() {
            // alert( "Load was performed." );
            var results = $(".ajax-container").find(".grid-item").length;
            // alert($('.ajax-container').find('.grid-item').length);
            if (results === 0) results = "No";
            if (results !== 1) results += " Results";
            else results += " Result";
            if ($(".paper-filter--results").length === 0)
                $(".paper-filter__content").prepend(
                    '<p class="paper-filter--results"></p>'
                );
            $(".paper-filter--results").text(results + " found");
        });
    };

    $("body").on("click", "label", function() {
        var thisFor = $(this).prop("for");
        var thisVal = $("a[rel=" + thisFor + "]").data("value");

        $("a[rel=" + thisFor + "]").toggleClass("active");

        var thisId = $(this).prop("for");
        var hidden = $("input#" + thisId);

        if ($("a[rel=" + thisFor + "]").hasClass("active")) hidden.val(thisVal);
        else hidden.val("");

        doAjax();
    });

    $("body").on("click", ".checkbox", function(e) {
        e.preventDefault();
        $(this).toggleClass("active");

        var thisId = $(this).prop("rel");
        var hidden = $("input#" + thisId);
        var thisVal = $(this).data("value");

        if ($(this).hasClass("active")) hidden.val(thisVal);
        else hidden.val("");

        doAjax();
    });

    $("body").on("click", ".grid figure:has(.read_more)", function(e) {
        if (!$(e.target).is("a")) {
            var dest = $(this)
                .find(".read_more")
                .attr("href");
            window.location.href = dest;
        }
    });

    $(".accordion__link").on("click", function(e) {
        var itemClicked = $(this);
        doJqueryAction.accordionClick(itemClicked);
    });

    $(".menu-button").on("click", function(e) {
        e.preventDefault();
        doJqueryAction.navClick();
    });

    $(".menu-close").on("click", function(e) {
        e.preventDefault();
        doJqueryAction.navClick();
    });

    $(".search-wrapper").on("click", function(e) {
        e.preventDefault();
        doJqueryAction.searchClick();
    });

    $(".mobileFade").on("click", function() {
        doJqueryAction.navClick();
    });

    $(".search-box")
        .on("focus", function() {
            $(this)
                .parent()
                .addClass("active");
        })
        .on("blur", function() {
            $(this)
                .parent()
                .removeClass("active");
            $(".search-wrapper").removeClass("active");
        });

    $(".calculator-overlay__reveal").on("click", function(e) {
        e.preventDefault();
        $("#ecocalculator2016").attr(
            "src",
            "https://new.ecocalculator.arjowigginsgraphic.com/front/intro.php?id=41"
        );
        $("#ecocalculator2016").on("load", function() {
            // do something once the iframe is loaded
            $(".calculator-overlay").addClass("calculator-overlay--hidden");
            $(".calculator-wrapper").addClass("calculator-wrapper--hidden");
        });
    });

    $(".button--sidebar, .modal__close").on("click", function(e) {
        e.preventDefault();
        $(".modal--overlay, .modal--overlay__modal").toggleClass(
            "modal--closed"
        );
    });

    $(window).load(function() {
        $("#carousel").flexslider({
            animation: "slide",
            controlNav: false,
            animationLoop: false,
            slideshow: false,
            itemWidth: 130,
            itemMargin: 5,
            prevText: "",
            nextText: "",
            asNavFor: "#slider"
        });

        $("#slider").flexslider({
            animation: "slide",
            controlNav: false,
            animationLoop: false,
            directionNav: false,
            slideshow: false,
            prevText: "",
            nextText: "",
            sync: "#carousel",
            start: function(slider) {
                $("body").removeClass("loading");
            }
        });
    });

    $(".media-grid--hover").hover(function() {
        $(this)
            .find(".media-grid--hover__bg, .media-grid__item__content")
            .toggleClass("visible");
    });

    (function($, sr) {
        // debouncing function from John Hann
        // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
        var debounce = function(func, threshold, execAsap) {
            var timeout;

            return function debounced() {
                var obj = this,
                    args = arguments;
                function delayed() {
                    if (!execAsap) func.apply(obj, args);
                    timeout = null;
                }

                if (timeout) clearTimeout(timeout);
                else if (execAsap) func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 500);
            };
        };
        // smartresize
        jQuery.fn[sr] = function(fn) {
            return fn ? this.bind("resize", debounce(fn)) : this.trigger(sr);
        };
    })(jQuery, "smartresize");

    // usage:
    $(window).smartresize(function() {
        doJqueryAction.navHeight();
        if ($(window).width() > 954) {
            $(".header").removeClass("fixed");
            $(".navigation-wrapper").removeClass("fixed");
        }

        /*
        if($(window).width() < 955){
            $.waypoints('refresh');
            $.waypoints('enable');
        }
        */
    });

    $.fn.slideFadeToggle = function(speed, easing, callback) {
        return this.animate(
            { opacity: "toggle", height: "toggle" },
            speed,
            easing,
            callback
        );
    };

    $("#hero-slider").responsiveSlides({
        auto: true,
        pager: false,
        speed: 1500,
        delay: 6500,
        before: function(i) {
            slidePaper = $("#rslides1_s" + i).attr("data-slide-paper");
            slideLink = $("#rslides1_s" + i).attr("data-slide-link");

            $(".home-hero__slide-text__inner__paper").text(slidePaper);
            $(".home-hero__slide-text__inner__link").attr("href", slideLink);
        }
    });

    (function($) {
        $.fn.visible = function(partial) {
            var $t = $(this),
                $w = $(window),
                viewTop = $w.scrollTop(),
                viewBottom = viewTop + $w.height(),
                _top = $t.offset().top,
                _bottom = _top + $t.height(),
                compareTop = partial === true ? _bottom : _top,
                compareBottom = partial === true ? _top : _bottom;
            return compareBottom <= viewBottom && compareTop >= viewTop;
        };
    })(jQuery);

    // var allMods = $(".module");
    // if (allMods) {
    $(".module").each(function(i, el) {
        var el = $(el);
        if (el.visible(true)) {
            el.addClass("already-visible");
        }
    });

    $(window).scroll(function(event) {
        $(".module").each(function(i, el) {
            var el = $(el);
            if (el.visible(true)) {
                el.addClass("come-in");
            }
        });
    });
    /*
    var $modules = $('.module');
    $(window).scroll(function(event) {
    	$modules.each(function(i, el) {
    		var $el = $modules.eq(i);
    		if ($el.visible(true)) {
    			$modules
    			.splice(i, 1);
    			$el
    			.addClass("come-in")
    			.removeClass('module');
    		}
    	});
    });
	*/

    function fade_home_top() {
        if ($(window).width() > 953) {
            var window_scroll = $(window).scrollTop();
            $(".home-hero__content .centered").css({
                opacity: 1 - window_scroll / 1000,
                "margin-top": window_scroll / 1.2
            });
        }
    }

    $(window).resize(function() {
        cycle_check();
    });

    function cycle_check() {
        var width = $(window).width(); // Checking size again after window resize

        if (width <= 768) {
            $("#hero-slider li img").css("background-image", "poo !important");
        }
    }

    $(window).scroll(function() {
        fade_home_top();

        var $this = $(this),
            $head = $(".header");
        $nav = $(".navigation-wrapper");
        if ($this.scrollTop() > 90) {
            $head.addClass("fixed");
            $nav.addClass("fixed");
        } else {
            $head.removeClass("fixed");
            $nav.removeClass("fixed");
        }
    });

    $(function() {
        var grid = $(".lt-ie10 .grid").attr("class");
        var grid_item = $(".lt-ie10 .showcase-grid .grid-item__link");

        if (grid == "grid showcase-grid") {
            $("figure").hover(
                function() {
                    $(this)
                        .find("figcaption")
                        .fadeTo(300, 1);
                    $(this)
                        .find(".background")
                        .fadeTo(300, 0.3);
                },
                function() {
                    $(this)
                        .find("figcaption")
                        .fadeTo(300, 0);
                    $(this)
                        .find(".background")
                        .fadeTo(300, 1);
                }
            );
        } else if (
            grid == "grid final-grid" ||
            grid == "grid brand-grid" ||
            grid == "grid"
        ) {
            $("figure").hover(
                function() {
                    $(this)
                        .find(".background")
                        .fadeTo(300, 0.3);
                    $(this)
                        .find(".effect-home .effect-home__link")
                        .fadeTo(300, 1);
                },
                function() {
                    $(this)
                        .find(".background")
                        .fadeTo(300, 1);
                    $(this)
                        .find(".effect-home .effect-home__link")
                        .fadeTo(300, 0);
                }
            );
        }
    });

    $(function() {
        var player = $("iframe#player1");

        if (player.length > 0) {
            var url =
                window.location.protocol + player.attr("src").split("?")[0];

            $(".video-overlay, .video-wrapper button").on("click", function() {
                // paused
                if ($(".play-button").length > 0) {
                    post("play");
                    $(".play-button")
                        .removeClass("play-button")
                        .addClass("pause-button")
                        .text("pause");
                    $(".video-wrapper img, .play-button")
                        .fadeTo("slow", 0)
                        .queue(function(next) {
                            $(".video-wrapper img").css({
                                bottom: "60px",
                                right: "60px"
                            });
                            // $('.lt-ie9 .video-wrapper__inner, .play-button').css('display','none');
                            next();
                        });
                } else {
                    // playing
                    post("pause");
                    $(".pause-button")
                        .removeClass("pause-button")
                        .addClass("play-button")
                        .text("play");
                }
            });

            $(".process-tabs__nav__list- li").on("click", function() {
                post("pause");
            });

            function post(action, value) {
                var data = {
                    method: action
                };

                if (value) {
                    data.value = value;
                }

                var message = JSON.stringify(data);
                player[0].contentWindow.postMessage(data, url);
            }
        }
    });
});

var selectedLink = document.querySelectorAll('.nav a');
selectedLink.forEach(a=>{
    a.addEventListener('click',function(e){
        a.style.fontWeight = 'bold'
    })
})