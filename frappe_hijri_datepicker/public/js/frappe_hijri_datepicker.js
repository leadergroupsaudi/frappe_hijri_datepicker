// frappe.ui.form.ControlDate = frappe.ui.form.ControlDate.extend({
//     make_input: function () {
//         var self = this;
//         this.$input_extra_date = $("<" + this.html_element + ">")
//             .attr("type", this.input_type)
//             .attr("autocomplete", "off")
//             .addClass("input-with-feedback form-control")
//             .prependTo(this.input_area);
//         this._super();
//         function convert_to_hijri(date) {
//             if (date.length === 0) {
//                 return false
//             }
//             var jd = $.calendars.instance('islamic').toJD(parseInt(date[0].year()), parseInt(date[0].month()), parseInt(date[0].day()));
//             var date = $.calendars.instance('gregorian').fromJD(jd);
//             var date_value = new Date(parseInt(date.year()), parseInt(date.month()) - 1, parseInt(date.day()));
//             if (date_value){self.$input.val(self.set_formatted_input(date_value));}
//         }
//         $(self.$input_extra_date).calendarsPicker({
//             calendar: $.calendars.instance('islamic', 'ar'),
//             onSelect: convert_to_hijri,
//             showOnFocus: true,
//         });
//     },
//     kuwaiticalendar: function (adjust) {
//         if (adjust) {
//             var today = new Date(moment(adjust).locale('en').format("YYYY-MM-DD"));
//             var day = today.getDate();
//             var month = today.getMonth() + 1;
//             var year = today.getFullYear();
//             var calendar = $.calendars.instance('gregorian', 'ar');
//             var hijri_calendar = $.calendars.instance('islamic', 'ar');
//             var jd = calendar.toJD(year, month, day);
//             var date = hijri_calendar.fromJD(jd);
//             var res = hijri_calendar.formatDate('yyyy-mm-dd', date.add(0, 'd'));
//             return [res, ''];
//         } else {
//             return adjust;
//         }

//     },
//     set_input: function (value) {
//         this._super(value);
//         if (value) {
//             var h_value = this.kuwaiticalendar(value);
//             $(this.$input_extra_date).val(h_value[0]);
//         }

//     },

// })


// this function is only for etmamtask for other sites use above fn 

(function () {
    if (!frappe?.ui?.form?.ControlDate) return;

    const proto = frappe.ui.form.ControlDate.prototype;
    const original_make_picker = proto.make_picker;

    proto.make_picker = function () {
        const me = this;
        
        const TARGET_DOCTYPE = "Customer";
        const TARGET_FIELD = "custom_date_of_birth_hijri";

        const doctype = me.frm?.doctype || me.df.parent;
        const fieldname = me.df.fieldname;

        // ❌ Not target → normal behavior
        if (
            doctype !== TARGET_DOCTYPE ||
            fieldname !== TARGET_FIELD
        ) {
            if (original_make_picker) {
                return original_make_picker.call(this);
            }
            return;
        }

        // ✅ Target field (Form + Quick Entry)
        if (original_make_picker) {
            original_make_picker.call(this);
        }

        if (me.$hijri_input) return;
        
     

        // 🔒 Hide original input
        me.$input.hide();
        me.$input_group?.find('.input-group-addon, .input-group-append').hide();

        // Create Hijri input
        me.$hijri_input = $('<input>')
            .attr({
                type: 'text',
                autocomplete: 'off',
                placeholder: __('Select Hijri Date'),
            })
            .addClass('form-control hijri-datepicker')
            .css({ marginTop: '5px' })
            .insertAfter(me.$input);
        
        if(cur_frm && cur_frm.doc.custom_date_of_birth_hijri){
            me.$hijri_input.val(cur_frm.doc.custom_date_of_birth_hijri);
        }
        // Hijri → Gregorian
        function convert_to_gregorian(dates) {
            // alert(String(dates))
            if (me.frm) {
                me.frm.set_value('custom_date_of_birth_hijri', dates);
                // alert("me",me.frm.doc.custom_date_of_birth_hijri)
            } else if (cur_frm) {
                cur_frm.set_value('custom_date_of_birth_hijri', dates);
                // alert("elseif",cur_frm.doc.custom_date_of_birth_hijri)
            }
            
            
            if (!dates || !dates.length) return;

            const h = dates[0];
            const jd = $.calendars.instance('islamic')
                .toJD(h.year(), h.month(), h.day());

            const g = $.calendars.instance('gregorian').fromJD(jd);


            //quick entry 
            const hijriStr =
                h.year() + '-' +
                String(h.month()).padStart(2, '0') + '-' +
                String(h.day()).padStart(2, '0');

            // ✅ THIS IS THE KEY (works in Quick Entry)
            me.set_value(hijriStr);

            // ✅ PURE DATE — NO TIME — NO TZ
            const dateStr =
                g.year() + '-' +
                String(g.month()).padStart(2, '0') + '-' +
                String(g.day()).padStart(2, '0');

            // ✅ This is what MySQL DATE wants

            if (me.frm) {
                me.frm.set_value('custom_date_of_birth', dateStr);
            } else if (cur_frm) {
                cur_frm.set_value('custom_date_of_birth', dateStr);
            }

            // ✅ Correct way (works in Quick Entry too)
            
            
          
        }
        // Init Hijri picker
        me.$hijri_input.calendarsPicker({
            calendar: $.calendars.instance('islamic', 'ar'),
            onSelect: convert_to_gregorian,
            showOnFocus: true,
        });
    };
})();