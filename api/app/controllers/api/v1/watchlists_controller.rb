# frozen_string_literal: true

module Api
  module V1
    class WatchlistsController < Api::V1::BaseController
      before_action :set_watchlist, only: [:destroy]

      # GET /api/v1/watchlists
      def index
        watchlists = @current_user.watch_lists.includes(:property, property: :property_images)

        watchlist_id_map = watchlists.map { |watchlist| [watchlist.property_id, watchlist.id] }.to_h

        properties = watchlists.map(&:property)

        properties_array = properties.map do |property|
          property_id = property.id
          property_data = property.as_json(
            include: {
              property_images: { only: [:id, :url, :position] }
            },
            methods: [:formatted_price]
          )
          property_data[:watchlist_id] = watchlist_id_map[property_id]
          property_data
        end

        render json: {
          properties: properties_array,
          count: properties_array.length
        }, status: :ok
      end

      # POST /api/v1/watchlists
      def create
        property = Property.find(watchlist_params[:property_id])
        existing_watchlist = @current_user.watch_lists.find_by(property_id: property.id)

        if existing_watchlist
          render json: { error: 'Property is already in your watchlist' }, status: :unprocessable_entity
          return
        end

        watchlist = @current_user.watch_lists.build(property: property)

        if watchlist.save
          property_data = property.as_json(
            include: {
              property_images: { only: [:id, :url, :position] }
            },
            methods: [:formatted_price]
          )

          render json: {
            property: property_data,
            message: 'Property added to watchlist'
          }, status: :created
        else
          render json: { errors: watchlist.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/watchlists/:id
      def destroy
        if @watchlist.destroy
          head :no_content
        else
          render json: { errors: @watchlist.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_watchlist
        @watchlist = @current_user.watch_lists.find(params[:id])
      end

      def watchlist_params
        params.require(:watchlist).permit(:property_id)
      end
    end
  end
end
