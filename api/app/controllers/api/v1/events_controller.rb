# frozen_string_literal: true

module Api
  module V1
    module Properties
      class EventsController < Api::V1::BaseController
        before_action :set_property

        # GET /api/v1/properties/:property_id/events
        def index
          events = @property.property_events.order(created_at: :desc)

          events_array = events.map { |event| event.as_json(only: [:id, :event_type, :data, :created_at]) }

          render json: {
            events: events_array,
            count: events_array.length
          }, status: :ok
        end

        private

        def set_property
          @property = Property.find(params[:property_id])
        end
      end
    end
  end
end
