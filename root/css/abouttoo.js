<script type="text/javascript">
var $body = document.getElementsByTagName('body')[0];
var $btnCopy = document.getElementById('btnCopy');
// var secretInfo = document.getElementById('secretInfo').innerHTML;
var secretInfo = "davinawooley@gmail.com";

var copyToClipboard = function(secretInfo) {
  var $tempInput = document.createElement('INPUT');
  $body.appendChild($tempInput);
  $tempInput.setAttribute('value', "davinawooley@gmail.com")
  $tempInput.select();
  document.execCommand('copy');
  $body.removeChild($tempInput);
}

$btnCopy.addEventListener('click', function(ev) {
  copyToClipboard(secretInfo);
});
</script> 

$(function () {
	var filterList = {
		init: function () {
			// MixItUp plugin
			// http://mixitup.io
			$('.portfolio-grid').mixItUp({
				selectors: {
  			  target: '.portfolio',
  			  filter: '.filter'	
  		  },
  		  load: {
    		  filter: 'all' // show app tab on first load
    		}     
			});								
		}
	};
	// Run the show!
	filterList.init();
});	