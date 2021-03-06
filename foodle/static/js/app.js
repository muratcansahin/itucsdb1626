const timestamps = _.map($('.timestamp'), function (element) {
  return element.innerHTML;
});

function humanizeTimestamps() {
  for (var i = 0; i < $('.timestamp').length; i++) {
    $('.timestamp')[i].innerHTML = moment(timestamps[i]).fromNow();
  }
}

$('#signup-form').submit(function (event) {
  event.preventDefault();

  const username = $('label.username').children().val();
  const displayName = $('label.display-name').children().val();
  const password = $('label.password').children().val();
  const passwordDuplicate = $('label.password-duplicate').children().val();

  console.log(username, displayName, password, passwordDuplicate);

  if (username.length < 8) {
    alert('Username is shorter than 8 characters.');
  } else if (username.length > 20) {
    alert('Username is longer than 20 characters.');
  } else if (displayName.length < 8) {
    alert('Display name should be longer than 8 characters.');
  } else if (displayName.length > 20) {
    alert('Display name should be shorter than 20 characters.');
  } else if (password.length < 8 || passwordDuplicate.length < 8) {
    alert('Password should be 8 characters long, at least.');
  } else {
    if (password === passwordDuplicate) {
      $.ajax({
        method: 'POST',
        url: '/users/',
        data: JSON.stringify({
          username: username,
          display_name: displayName,
          password: password,
        }),
        contentType: 'application/json'
      })
      .success(function (data, textStatus, xhr) {
        window.location.replace(xhr.getResponseHeader('location'));
      })
      .fail(function (data, textStatus, xhr) {
        alert('User with same name already exists.');
      })
    } else {
      alert('Password and re-enter password fields are not same.');
      //  Set focus to the password field
      $('label.password').children().focus()
    }
  }
});

function dispatchCreate(entity) {
  if (entity === 'post_image') {
    const link = $('label.link').children().val()

    $.ajax({
      method: 'POST',
      url: '/post_images/',
      data: JSON.stringify({
        link: link,
        post_id: 1
      }),
      contentType: 'application/json'
    })
    .success(function (data, textStatus, xhr) {
      window.location = xhr.getResponseHeader('location')
    })
  }

  return false;
}

function initializeDatabase() {
  $.ajax({
    method: 'POST',
    url: '/database_initialization/'
  })
  .success(function () {
    alert('Initialized database successfully.');
    window.location.replace('/sessions/new');
  })
}

function addComment(entity) {
	if (entity === "check_in_comment") {
	  const message = $('#comment_input').val()
	  const user_id = $('#user_id_input').val()
	  const check_in_id = $('#check_in_id_input').val()

	  $.ajax({
	    method: 'POST',
	    url: '/check_in_comments/',
	    dataType: "json",
	    data: JSON.stringify({
	      body: message,
	      user_id: user_id,
	      check_in_id: check_in_id
	    }),
	    contentType: 'application/json'
	  })
	  .always(function (data, textStatus, xhr) {
	    window.location.replace('/check_in_comments')
	  });
	}
	else {
	  const body = $('label.body').children().val()

	  $.ajax({
	    method: 'POST',
	    url: '/post_comments/',
	    data: JSON.stringify({
	      body: body
	    }),
	    contentType: 'application/json'
	  })
	  .success(function (data, textStatus, xhr) {
	    window.location.replace(xhr.getResponseHeader('location'))
	  })
	}
}

function addRating() {
	const rating = $('#rating_input').val()
	const user_id = $('#user_id_input').val()
	const place_id = $('#place_id_input').val()

	$.ajax({
	 	method: 'POST',
	    url: '/place_ratings/',
	    dataType: "json",
	    data: JSON.stringify({
	    	rating: rating,
	    	user_id: user_id,
	    	place_id: place_id
	    }),
	    contentType: 'application/json'
	})
	.always(function (data, textStatus, xhr) {
    window.location.replace('/place_ratings')
	});
}

function addChatRoom() {

  const user_id = $('#user_id_input').val()
  const name = $('label.name').children().val()

  $.ajax({
    method: 'POST',
      url: '/chat_rooms/',
      dataType: "json",
      data: JSON.stringify({
        user_id: user_id,
        name: name
      }),
      contentType: 'application/json'
  })
  .always(function (data, textStatus, xhr) {
    window.location.replace('/chat_rooms')
  });
}

function addChatRoomMessage() {
  const user_id = $('#user_id_input').val()
  const chat_room_id = $('#chat_room_id_input').val()
  const body = $('label.body').children().val()

  $.ajax({
    method: 'POST',
      url: '/chat_room_messages/',
      dataType: 'json',
      data: JSON.stringify({
        user_id: user_id,
        chat_room_id: chat_room_id,
        body: body
      }),
      contentType: 'application/json'
  })
  .always(function (data, textStatus, xhr) {
    window.location.replace('/chat_room_messages')
  });
}



var semaphore = 0;

$('#search').on('keydown', function (keyEvent) {
  setTimeout(function () {
    const result = $('#search').val();

    if (result !== '') {
      semaphore += 1;

      $.ajax({
        method: 'GET',
        url: '/search?parameter=' + result
      })
      .success(function (data, textStatus, xhr) {
        semaphore -= 1;

        if (!semaphore) {
          for (var i = 0; i < 5; ++i) {
            $('.cell-' + i).css('border-radius', '0');
            $('.cell-' + i).css('visibility', 'hidden');
          }

          $('#search').css('color', 'black');

          $('.top-bar-extend').css('visibility', 'visible');

          var dataCount = 0;

          $('.cell-0').css('border-radius', '10px 10px 0 0');

          for (var i = 0; i < data[0].length; ++i, ++dataCount) {
            $('.cell-' + dataCount).css('visibility', 'visible');
            $('.cell-' + dataCount + ' p.display-name')[0].innerHTML = data[0][i][2];
            $('.cell-' + dataCount + ' span.username')[0].innerHTML = '@' + data[0][i][1];
            $('.cell-' + dataCount + ' span.username').css('color', 'rgb(170, 170, 170)');
            $('.cell-' + dataCount + ' a').attr('href', '/users/' + data[0][i][0]);
            $('.cell-' + dataCount + ' .profile-image-search').css('background-image', 'url(' + data[0][i][3] + ')');
          }

          for (var i = 0; i < data[1].length; ++i, ++dataCount) {
            $('.cell-' + dataCount).css('visibility', 'visible');
            $('.cell-' + dataCount + ' p.display-name')[0].innerHTML = data[1][i][0];
            $('.cell-' + dataCount + ' span.username')[0].innerHTML = data[1][i][1];
            $('.cell-' + dataCount + ' a').attr('href', '/places/' + data[1][i][3]);
            $('.cell-' + dataCount + ' .profile-image-search').css('background-image', 'url(' + data[1][i][2] + ')');
          }

          if (dataCount === 1) {
            $('.cell-0').css('border-radius', '10px');
          } else if (dataCount === 0) {
            $('#search').css('color', 'red');
          } else {
            $('.cell-' + (dataCount - 1)).css('border-radius', '0 0 10px 10px');
          }
        }
      });
    } else {
      $('.top-bar-extend').css('visibility', 'hidden');
      $('.top-bar-extend-cell').css('visibility', 'hidden');
    }
  }, 5);
});

$('div.callout.new-entity input').on('keydown', function (keyEvent) {
  if (keyEvent.which == 13) {
    var values = {};
    $.each($('#new-entity').serializeArray(), function(i, field) {
      values[field.name] = field.value;
    });

    values.user_id = parseInt($('#container').attr('data-sender-id'));
    values.place_id = selected;
    values.score *= 10;

    $.ajax({
      method: 'POST',
      url: '/posts/',
      data: JSON.stringify(values),
      contentType: 'application/json'
    })
    .success(function (data, textStatus, xhr) {
      window.location.reload();
    })
    .error(function () {
      alert('Please make sure you selected place from the autocomplete dropdown.')
    });
  }
})

var autocompleteList = null;
var selected = null;

if ($('#meal-place').autocomplete) {
  $('#meal-place').autocomplete({
    source: function (request, callback) {
      $('#spinner').css('visibility', 'visible');
      $.ajax({
        method: 'GET',
        url: '/places?name=' + request.term,
        headers: {
          'Accept': 'application/json'
        }
      })
      .success(function (data, textStatus, xhr) {
        autocompleteList = data;

        callback(data.map(function (element) {
          return element[1];
        }));

        $('#spinner').css('visibility', 'hidden');
      });
    },
    select: function (event, ui) {
      selected = autocompleteList.filter(function (element) {
        return element[1] == ui.item.label;
      }).pop()[0];
    },
    open: function () {

    }
  })
}

$.each($('.like-button'), function (i, element) {
  if ($(this).attr('data-exists') === 'True') {
    $(this).addClass('enabled');
  }

  $(element).click(function () {
    var self = this;

    if ($(self).attr('data-exists') === 'False') {
      $.ajax({
        method: 'POST',
        url: $(self).attr('data-ajax'),
        data: JSON.stringify({
          user_id: $('#container').attr('data-sender-id')
        }),
        contentType: 'application/json'
      })
      .success(function () {
        var split = $(self)[0].innerHTML.split(' ');
        var count = parseInt(split[5]);
        count += 1;
        split[5] = '' + count;
        $(self)[0].innerHTML = split.join(' ');

        $(self).addClass('enabled');
        $(self).attr('data-exists', 'True');
      });
    } else {
      $.ajax({
        method: 'DELETE',
        url: $(self).attr('data-ajax'),
        data: JSON.stringify({
          user_id: $('#container').attr('data-sender-id')
        }),
        contentType: 'application/json'
      })
      .success(function () {
        var split = $(self)[0].innerHTML.split(' ');
        var count = parseInt(split[5]);
        count -= 1;
        split[5] = '' + count;
        $(self)[0].innerHTML = split.join(' ');

        $(self).removeClass('enabled');
        $(self).attr('data-exists', 'False');
      });
    }
  });
});

$('#delete-user').click(function () {
  const identifier = $('#delete-user').attr('data-user-id');

  $.ajax({
    method: 'DELETE',
    url: '/users/' + identifier
  })
  .success(function (data, textStatus, xhr) {
    alert('Operation completed.');
    window.location.replace('/users');
  });
});

$('#update-user').click(function () {
  const identifier = $('#update-user').attr('data-user-id');

  $.ajax({
    method: 'PUT',
    url: '/users/' + identifier,
    data: JSON.stringify({
      display_name: $('#displayName')[0].innerHTML,
      username: $('#username')[0].innerHTML[0] === '@' ? $('#username')[0].innerHTML.split('').splice(1).join(''):$('#username')[0].innerHTML,
      user_image_url: $('#user_image_url')[0].innerHTML
    }),
    contentType: 'application/json'
  })
  .success(function () {
    window.location.replace('/users/' + identifier);
  })
  .fail(function () {
    alert('A user with given username already exists.')
  });
});

$('#update-post').click(function () {
  const identifier = $('#update-post').attr('data-post-id');

  $.ajax({
    method: 'PUT',
    url: '/posts/' + $('#update-post').attr('data-post-id'),
    data: JSON.stringify({
      title: $('#post-title')[0].innerHTML,
      body: $('#post-body')[0].innerHTML,
      cost: $('#post-cost')[0].innerHTML[0] === '€' ? $('#post-cost')[0].innerHTML.split('').splice(1).join(''):$('#post-cost')[0].innerHTML,
      score: parseFloat($('#post-score')[0].innerHTML) * 10
    }),
    contentType: 'application/json'
  })
  .success(function () {
    window.location.replace('/users/' + $('#update-post').attr('data-user-id'));
  });
});

$('#delete-post').click(function () {
  const identifier = $('#delete-post').attr('data-post-id');

  $.ajax({
    method: 'DELETE',
    url: '/posts/' + $('#delete-post').attr('data-post-id')
  })
  .success(function () {
    window.location.replace('/users/' + $('#delete-post').attr('data-user-id'));
  });
});

$('#init-db').click(function () {
  $.ajax({
    method: 'POST',
    url: '/database_initialization/'
  })
  .success(function (data, textStatus, xhr) {
    alert('Operation completed.');
    window.location.replace('/sessions/new');
  });
});

$('#activate-user').click(function () {
  const identifier = $('#container').attr('data-sender-id');

  $.ajax({
    method: 'POST',
    url: '/users/' + identifier + '/user_activation',
    data: JSON.stringify({
      activation_key: $('#activation_key').val()
    }),
    contentType: 'application/json'
  })
  .success(function () {
    window.location.replace('/users/' + identifier);
  });
});

humanizeTimestamps(); setInterval(humanizeTimestamps, 10000);
$('#search').removeAttr('disabled');

function dispatchUpdate(entity, identifier) {
  if (entity === 'user') {
    const username = $('label.username').children().val()
    const password = $('label.password').children().val()
    const passwordDuplicate = $('label.password-duplicate').children().val()

    if (password === passwordDuplicate) {
      $.ajax({
        method: 'PUT',
        url: '/users/' + identifier,
        data: JSON.stringify({
          username: username,
          password: password
        }),
        contentType: 'application/json'
      })
      .success(function (data, textStatus, xhr) {
        window.location.replace(xhr.getResponseHeader('location'))
      })
      .fail(function (data, textStatus, xhr) {
        alert('Username and password, both needs to be typed and be 7 to 20 characters long.')
      })
    } else {
      //  Set focus to the password field
      $('label.password').children().focus()
    }
  } else if (entity === 'post_image') {
    const link = $('label.link').children().val()

    $.ajax({
      method: 'PUT',
      url: '/post_images/' + identifier,
      data: JSON.stringify({
        link: link
      }),
      contentType: 'application/json'
    })
    .success(function (data, textStatus, xhr) {
      window.location = xhr.getResponseHeader('location')
    });
  } else if (entity === 'post_comment') {
    const body = $('label.body').children().val()

    $.ajax({
      method: 'PUT',
      url: '/post_comments/' + identifier,
      data: JSON.stringify({
        body: body
      }),
      contentType: 'application/json'
    })
    .success(function (data, textStatus, xhr) {
      window.location = xhr.getResponseHeader('location')
    });
  } else if (entity === 'check_in_comment') {
    const message = $('#comment_edit').val()

    $.ajax({
      method: 'PUT',
      url: '/check_in_comments/' + identifier,
      data: JSON.stringify({
        body: message
      }),
      contentType: 'application/json'
    })
    .always(function (data, textStatus, xhr) {
      window.location = xhr.getResponseHeader('location')
    });
  } else if (entity === 'place_rating') {
    const rating = $('#rating_edit').val()

    $.ajax({
      method: 'PUT',
      url: '/place_ratings/' + identifier,
      data: JSON.stringify({
        rating: rating
      }),
      contentType: 'application/json'
    })
    .always(function (data, textStatus, xhr) {
      window.location = xhr.getResponseHeader('location')
    });
  } else if(entity === 'chat_room') {
    const name = $('label.name').children().val();

    $.ajax({
      method: 'PUT',
      url: '/chat_rooms/' + identifier,
      data: JSON.stringify({
        name: name
      }),
      contentType: 'application/json'
    })
    .always(function (data, textStatus, xhr) {
      window.location = xhr.getResponseHeader('location');
    });
  } else if(entity === 'chat_room_message') {
    const body = $('label.body').children().val();

    $.ajax({
      method: 'PUT',
      url: '/chat_room_messages/' + identifier,
      data: JSON.stringify({
        body: body
      }),
      contentType: 'application/json'
    })
    .always(function (data, textStatus, xhr) {
      window.location.replace('../');
    });
  } else if (entity === 'city') {
    const name = $('label.name').children().val();
    const description = $('label.description').children().val();

    $.ajax({
      method: 'PUT',
      url: '/cities/' + identifier,
      data: JSON.stringify({
        name: name,
        description: description
      }),
      contentType: 'application/json'
    })
    .always(function (data, textStatus, xhr) {
      window.location = xhr.getResponseHeader('location');
    });
  } else if(entity === 'place') {
    const name = $('label.name').children().val()
    const description = $('label.description').children().val()

    $.ajax({
      method: 'PUT',
      url: '/places/' + identifier,
      data: JSON.stringify({
        name: name,
        description: description
      }),
      contentType: 'application/json'
    })
    .always(function (data, textStatus, xhr) {
      window.location.replace('../');
    });
  } else if(entity === 'place_instances') {
    const name = $('label.name').children().val()
    const address = $('label.address').children().val()
    const capacity = $('label.capacity').children().val()

    $.ajax({
      method: 'PUT',
      url: '/place_instances/' + identifier,
      data: JSON.stringify({
        name: name,
        address: address,
        capacity: capacity
      }),
      contentType: 'application/json'
    })
    .always(function (data, textStatus, xhr) {
      window.location.replace('../');
    });
  }

  return false;
}


function dispatchDelete(entity, identifier) {
  if (entity === 'user') {
    $.ajax({
      method: 'DELETE',
      url: '/users/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/users')
    })
  } else if (entity === 'post_image') {
    $.ajax({
      method: 'DELETE',
      url: '/post_images/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/post_images')
    })
  }
  else if (entity === 'post_comment') {
    $.ajax({
      method: 'DELETE',
      url: '/post_comments/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/post_comments')
    })
  }
  else if (entity === 'check_in_comment') {
    $.ajax({
      method: 'DELETE',
      url: '/check_in_comments/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/check_in_comments')
    })
  }
  else if (entity === 'place_rating') {
    $.ajax({
      method: 'DELETE',
      url: '/place_ratings/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/place_ratings')
    })
  } else if (entity === 'chat_room') {
    $.ajax({
      method: 'DELETE',
      url: '/chat_rooms/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/chat_rooms')
    })
  }
  else if (entity === 'chat_room_message') {
    $.ajax({
      method: 'DELETE',
      url: '/chat_room_messages/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/chat_room_messages')
    })
  } else if (entity === 'place') {

    $.ajax({
      method: 'DELETE',
      url: '/places/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/places')
    })

  } else if (entity === 'place_instance') {

    $.ajax({
      method: 'DELETE',
      url: '/place_instances/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/place_instances')
    })

  } else if (entity === 'city') {
    $.ajax({
      method: 'DELETE',
      url: '/cities/' + identifier
    })
    .success(function (data, textStatus, xhr) {
      alert('Operation completed.')
      window.location.replace('/cities')
    })

  }
}

function addCity() {

    const user_id = $('#user_id_input').val()
    const name = $('label.name').children().val()
    const description = $('label.description').children().val()
    $.ajax({
      method: 'POST',
        url: '/cities/',
        dataType: "json",
        data: JSON.stringify({
          user_id: user_id,
          name: name,
          description: description
        }),
        contentType: 'application/json'
    })
    .always(function (data, textStatus, xhr) {
      window.location.replace('/cities')
    });
}

function addPlace() {
  const user_id = $('#user_id_input').val();
  const name = $('label.name').children().val();
  const description = $('label.description').children().val();

  $.ajax({
    method: 'POST',
      url: '/places/',
      dataType: "json",
      data: JSON.stringify({
        user_id: user_id,
        name: name,
        description: description
      }),
      contentType: 'application/json'
  })
  .always(function (data, textStatus, xhr) {
    window.location.replace('/places')
  });

}

function addPlaceInstance() {
  const user_id = $('#user_id_input').val();
  const place_id = $('#place_id_input').val();
  const city_id = $('#city_id_input').val();
  const name = $('label.name').children().val();
  const address = $('label.address').children().val();
  const capacity = $('label.capacity').children().val();

  $.ajax({
    method: 'POST',
    url: '/place_instances/',
    dataType: "json",
    data: JSON.stringify({
      user_id: user_id,
      place_id: place_id,
      city_id: city_id,
      name: name,
      address: address,
      capacity: capacity
    }),
    contentType: 'application/json'
  })
  .always(function (data, textStatus, xhr) {
    window.location.replace('/place_instances')
  });
}

if ($('#login-form')) {
  $('#login-form').submit(function (e) {
    e.preventDefault();

    const username = $('#login-username').val() !== "" ? $('#login-username').val() : null;
    const password = $('#login-password').val() !== "" ? $('#login-password').val() : null;

    $.ajax({
      method: 'POST',
      url: '/sessions/',
      contentType: 'application/json',
      data: JSON.stringify({
        username: username,
        password: password,
      })
    })
    .success(function (data, textStatus, xhr) {
      window.location.replace(xhr.getResponseHeader('location'));
    })
    .fail(function (data, textStatus, xhr) {
      if (data.status === 404) {
        alert('Invalid username/password combination.');
      } else {
        alert('Invalid authentication parameters.');
      }
    })
  });
}

$.each($('textarea.post-comment-textarea'), function (i, field) {
  $(field).on('keydown', function (event) {
    if (event.keyCode === 13) {
      const body = $(field).val();
      const userId = parseInt($('#container').attr('data-sender-id'), 10);

      $.ajax({
        method: 'POST',
        url: $(field).attr('data-ajax'),
        data: JSON.stringify({
          body: body,
          user_id: userId,
        }),
        contentType: 'application/json',
      })
      .always(function (data, textStatus, xhr) {
        location.reload()
      })
    }
  });
});

function deleteComment(postId, commentId) {
  $.ajax({
    method: 'DELETE',
    url: '/posts/' + postId + '/comments/' + commentId + '/',
  })
  .success(function (data, textStatus, xhr) {
    location.reload()
  });
}

function flushCookies() {
  window.location.replace('/sessions/new');
}
