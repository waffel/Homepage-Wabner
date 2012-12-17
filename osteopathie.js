$(document).ready(function() {
	$('#clickme').click(function() {
	  $('#clickme').text(($('#clickme').text() == 'Weiterlesen ...') ? 'Weniger' : 'Weiterlesen ...');
	  $('#more').slideToggle('slow', function() {});
	});
});
