$(document).ready(function() {
    $('.input-group input[required], .input-group textarea[required], .input-group select[required]').on('keyup change', function() {
		var $form = $(this).closest('form'),
            $group = $(this).closest('.input-group'),
			$addon = $group.find('.input-group-addon'),
			$icon = $addon.find('span'),
			state = false;
            
    	if (!$group.data('validate')) {
			state = $(this).val() ? true : false;
		}else if ($group.data('validate') == "email") {
			state = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($(this).val())
		}else if($group.data('validate') == 'phone') {
			state = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/.test($(this).val())
		}else if ($group.data('validate') == "length") {
			state = $(this).val().length >= $group.data('length') ? true : false;
		}else if ($group.data('validate') == "number") {
			state = !isNaN(parseFloat($(this).val())) && isFinite($(this).val());
		}

		if (state) {
				$addon.removeClass('danger');
				$addon.addClass('success');
				$icon.attr('class', 'glyphicon glyphicon-ok');
		}else{
				$addon.removeClass('success');
				$addon.addClass('danger');
				$icon.attr('class', 'glyphicon glyphicon-remove');
		}
        
        if ($('#formulario-login').find('.input-group-addon.danger').length == 0) {
            $('#formulario-login').find('[type="submit"]').prop('disabled', false);
        }else{
            $('#formulario-login').find('[type="submit"]').prop('disabled', true);
        }

        if ($('#formulario-registro').find('.input-group-addon.danger').length == 0) {
            $('#formulario-registro').find('[type="submit"]').prop('disabled', false);
        }else{
            $('#formulario-registro').find('[type="submit"]').prop('disabled', true);
        }
	});
    
    $('.input-group input[required], .input-group textarea[required], .input-group select[required]').trigger('change');
    
});

$(function()
{
    $(document).on('click', '.btn-add', function(e)
    {
        e.preventDefault();

        if($(this).parents('.entry:first').find('input').val().length>0){
        	var controlForm = $('.controls form:first'),
            currentEntry = $(this).parents('.entry:first'),
            newEntry = $(currentEntry.clone()).appendTo(controlForm);

            currentEntry.addClass('agregado');

	        newEntry.find('input').val('');
	        controlForm.find('.entry:not(:last) .btn-add')
	            .removeClass('btn-add').addClass('btn-remove')
	            .removeClass('btn-success').addClass('btn-danger')
	            .html('<span class="glyphicon glyphicon-minus"></span>');
        }
    }).on('click', '.btn-remove', function(e)
    {
		$(this).parents('.entry:first').remove();

		e.preventDefault();
		return false;
	});
});